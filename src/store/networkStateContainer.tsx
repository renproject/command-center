import { TxStatus } from "@renproject/interfaces";
import { Currency, CurrencyIcon, Record } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { List, Map, OrderedMap, OrderedSet } from "immutable";
import React, { useState } from "react";
import { createContainer } from "unstated-next";
import { PromiEvent } from "web3-core";

import { MultiStepPopup } from "../components/common/popups/MultiStepPopup";
import { WithdrawPopup } from "../components/common/popups/WithdrawPopup";
import { TokenBalance } from "../components/common/TokenBalance";
import { NodeStatistics } from "../lib/darknode/jsonrpc";
import {
    calculateSecondsPerBlock, DarknodeCounts, DarknodeFeeStatus, fetchCycleAndPendingRewards,
    fetchDarknodeBalanceHistory, fetchDarknodeDetails, getDarknodeCounts, getMinimumBond,
    getOperatorDarknodes, HistoryPeriod, NULL, RegistrationStatus,
} from "../lib/ethereum/contractReads";
import {
    approveNode, deregisterNode, fundNode, refundNode, registerNode, withdrawToken,
} from "../lib/ethereum/contractWrites";
import { AllTokenDetails, getPrices, OldToken, Token, TokenPrices } from "../lib/ethereum/tokens";
import { catchBackgroundException, catchInteractionException } from "../lib/react/errors";
import { PopupContainer } from "./popupStore";
import useStorageState from "./useStorageState/useStorageState";
import { Web3Container } from "./web3Store";

export class DarknodesState extends Record({
    ID: "",
    multiAddress: "",
    publicKey: "",
    ethBalance: new BigNumber(0),
    feesEarned: OrderedMap<Token, BigNumber>(),
    oldFeesEarned: OrderedMap<OldToken, BigNumber>(),
    feesEarnedTotalEth: new BigNumber(0),

    cycleStatus: OrderedMap<string, DarknodeFeeStatus>(),

    averageGasUsage: 0,
    lastTopUp: null,
    expectedExhaustion: null,

    peers: 0,
    registrationStatus: "" as RegistrationStatus,
    operator: "",

    nodeStatistics: null as NodeStatistics | null,
}) { }

export type WaitForTX = <T>(promiEvent: PromiEvent<T>, onConfirmation?: (confirmations?: number) => void) => Promise<string>;

const useNetworkStateContainer = () => {
    const { web3, renNetwork, address } = Web3Container.useContainer();
    const { setPopup, clearPopup } = PopupContainer.useContainer();

    const [secondsPerBlock, setSecondsPerBlock] = useState(null as number | null);

    const [tokenPrices, setTokenPrices] = useState(null as TokenPrices | null);

    const [darknodeCount, setDarknodeCount] = useState(null as BigNumber | null);
    const [orderCount, setOrderCount] = useState(null as BigNumber | null);

    const [registrySync, setRegistrySync] = useState({ progress: 0, target: 0 });

    const [darknodeDetails, setDarknodeDetails] = useState(Map<string, DarknodesState>());

    const [balanceHistories, setBalanceHistories] = useState(Map<string, OrderedMap<number, BigNumber>>());

    // tslint:disable-next-line: no-any
    const [transactions, setTransactions] = useState(OrderedMap<string, PromiEvent<any>>());
    const [confirmations, setConfirmations] = useState(OrderedMap<string, number>());

    const [currentCycle, setCurrentCycle] = useState("");
    const [previousCycle, setPreviousCycle] = useState("");
    const [pendingRewards, setPendingRewards] = useState(OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>());
    const [pendingTotalInEth, setPendingTotalInEth] = useState(OrderedMap<string /* cycle */, BigNumber>());
    const [pendingRewardsInEth, setPendingRewardsInEth] = useState(OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>());
    const [cycleTimeout, setCycleTimeout] = useState(new BigNumber(0));
    const [currentShareCount, setCurrentShareCount] = useState(new BigNumber(1));

    const [currentDarknodeCount, setCurrentDarknodeCount] = useState(null as number | null);
    const [previousDarknodeCount, setPreviousDarknodeCount] = useState(null as number | null);
    const [nextDarknodeCount, setNextDarknodeCount] = useState(null as number | null);

    ///////////////////////////////////////////////////////////
    // If these change, localstorage migration may be needed //
    ///////////////////////////////////////////////////////////
    const [quoteCurrency, setQuoteCurrency] = useStorageState(localStorage, "quoteCurrency", Currency.USD);
    const [darknodeNames, setDarknodeNames] = useStorageState(localStorage, "darknodeNames", Map<string, string>(), (s) => Map<string, string>(JSON.parse(s as string)));
    const [darknodeRegisteringList, setDarknodeRegisteringList] = useStorageState(localStorage, "darknodeRegisteringList", Map<string, string>(), (s) => Map<string, string>(JSON.parse(s as string)));
    // Map from operator-address to list of darknodes.
    const [darknodeList, setDarknodeList] = useStorageState(localStorage, "darknodeList", Map<string, OrderedSet<string>>(), (s) => Map<string, OrderedSet<string>>(JSON.parse(s as string)).map(x => OrderedSet<string>(x)));
    const [hiddenDarknodes, setHiddenDarknodes] = useStorageState(localStorage, "hiddenDarknodes", Map<string, OrderedSet<string>>(), (s) => Map<string, OrderedSet<string>>(JSON.parse(s as string)).map(x => OrderedSet<string>(x)));
    const [withdrawAddresses, setWithdrawAddresses] = useStorageState(localStorage, "withdrawAddresses", Map<Token, List<string>>(), (s) => Map<Token, List<string>>(JSON.parse(s as string)).map(x => List<string>(x)));
    ///////////////////////////////////////////////////////

    const updateTokenPrices = async () => {
        try {
            setTokenPrices(await getPrices());
        } catch (error) {
            catchBackgroundException(error, "Error in networkActions > updateTokenPrices");
        }
    };

    const updateSecondsPerBlock = async () => {
        const newSecondsPerBlock = await calculateSecondsPerBlock(web3);
        if (newSecondsPerBlock !== null) {
            setSecondsPerBlock(newSecondsPerBlock);
        }
    };

    const updateDarknodeBalanceHistory = async (
        darknodeID: string,
        previousHistory: OrderedMap<number, BigNumber> | null,
        historyPeriod: HistoryPeriod,
        useSecondsPerBlock: number,
    ) => {
        const balanceHistory = await fetchDarknodeBalanceHistory(web3, darknodeID, previousHistory, historyPeriod, useSecondsPerBlock);
        setBalanceHistories(latestBalanceHistories => latestBalanceHistories.set(
            darknodeID,
            balanceHistory,
        ));
    };

    const hideDarknode = (darknodeID: string, operator: string, network: string) => {
        try {
            let operatorHiddenDarknodes = hiddenDarknodes.get(operator) || OrderedSet<string>();

            operatorHiddenDarknodes = operatorHiddenDarknodes.add(darknodeID);

            setHiddenDarknodes(latestHiddenDarknodes => (latestHiddenDarknodes || Map()).set(operator, operatorHiddenDarknodes));
        } catch (error) {
            catchInteractionException(error, "Error in networkReducer > removeDarknode");
        }
    };

    const unhideDarknode = (darknodeID: string, operator: string, network: string) => {
        try {
            let operatorHiddenDarknodes = hiddenDarknodes.get(operator) || OrderedSet<string>();

            operatorHiddenDarknodes = operatorHiddenDarknodes.remove(darknodeID);

            setHiddenDarknodes(latestHiddenDarknodes => (latestHiddenDarknodes || Map()).set(operator, operatorHiddenDarknodes));
        } catch (error) {
            catchInteractionException(error, "Error in networkReducer > removeDarknode");
        }
    };


    const updateDarknodeCounts = (darknodeCounts: DarknodeCounts) => {
        setCurrentDarknodeCount(darknodeCounts.currentDarknodeCount);
        setPreviousDarknodeCount(darknodeCounts.previousDarknodeCount);
        setNextDarknodeCount(darknodeCounts.nextDarknodeCount);
    };


    const addDarknodes = (darknodes: OrderedSet<string>) => {
        if (!address) {
            throw new Error(`Unable to retrieve account address.`);
        }
        let newList = darknodeList.get(address) || OrderedSet<string>();
        let newNames = darknodeNames;

        // Add to list if it's not already in there
        newList = darknodes.merge(darknodes);

        newList.map((darknodeID: string) => {
            if (!newNames.has(darknodeID)) {
                newNames = newNames.set(darknodeID, `Darknode ${newList.toList().indexOf(darknodeID) + 1}`);
            }
            return null;
        });

        const newDarknodeRegisteringList = darknodeRegisteringList
            .filter((_: string, darknodeID: string) => !newList.contains(darknodeID));

        setDarknodeList(latestDarknodeList => (latestDarknodeList || Map()).set(address, newList));
        setDarknodeNames(newNames);
        setDarknodeRegisteringList(newDarknodeRegisteringList);
    };

    const storeEmptyDarknodeList = () => {
        if (address) {
            setDarknodeList(latestDarknodeList => (latestDarknodeList || Map()).set(address, OrderedSet()));
        }
    };


    const addRegisteringDarknode = (darknodeID: string, publicKey: string) => {
        setDarknodeRegisteringList(latestDarknodeRegisteringList => (latestDarknodeRegisteringList || Map()).set(darknodeID, publicKey));
    };


    const removeRegisteringDarknode = (darknodeID: string) => {
        return setDarknodeRegisteringList(latestDarknodeRegisteringList => (latestDarknodeRegisteringList || Map()).remove(
            darknodeID
        ));
    };

    const addToWithdrawAddresses = (token: Token, withdrawAddress: string) => {
        const foundList = withdrawAddresses.get(token, List());
        if (foundList.contains(withdrawAddress)) {
            return;
        }
        return setWithdrawAddresses(
            latestWithdrawAddresses => (latestWithdrawAddresses || Map()).set(
                token,
                foundList.push(withdrawAddress),
            ),
        );

    };
    const removeFromWithdrawAddresses = (token: Token, withdrawAddress: string) => {
        const list = withdrawAddresses.get(token);
        if (!list) { return; }
        const foundIndex = list.findIndex((addr) => addr === withdrawAddress);
        if (foundIndex === -1) { return; }
        return setWithdrawAddresses(
            latestWithdrawAddresses => (latestWithdrawAddresses || Map()).set(
                token,
                list.remove(foundIndex),
            ),
        );
    };

    const storeDarknodeDetails = (details: DarknodesState) => {
        return setDarknodeDetails(latestDarknodeDetails => latestDarknodeDetails.set(
            details.ID,
            details,
        ));
    };

    const storeDarknodeName = (darknodeID: string, name: string) => {
        return setDarknodeNames(latestDarknodeNames => (latestDarknodeNames || Map()).set(darknodeID, name));
    };

    // tslint:disable-next-line: no-any
    const addTransaction = (txHash: string, tx: PromiEvent<any>) => {
        return setTransactions(latestTransactions => latestTransactions.set(txHash, tx));
    };
    const storeTxConfirmations = (txHash: string, numberOfConfirmations: number) => {
        return setConfirmations(latestConfirmations => latestConfirmations.set(txHash, numberOfConfirmations));
    };

    const waitForTX = async <T extends {}>(promiEvent: PromiEvent<T>, onConfirmation?: (confirmations?: number) => void) => new Promise<string>((resolve, reject) => {
        promiEvent.on("transactionHash", (txHash) => {
            resolve(txHash);
            addTransaction(txHash, promiEvent);
            promiEvent.on("confirmation", (numberOfConfirmations) => {
                storeTxConfirmations(txHash, numberOfConfirmations);
                if (onConfirmation) { onConfirmation(numberOfConfirmations); }
            });
            promiEvent.on("error", () => {
                storeTxConfirmations(txHash, -1);
            });
        }).catch(reject);
    });

    const updateCycleAndPendingRewards = async (
    ) => {
        const getDarknodeCountsPromise = getDarknodeCounts(web3, renNetwork);
        const fetchCycleAndPendingRewardsPromise = fetchCycleAndPendingRewards(web3, renNetwork, tokenPrices);

        try {
            const darknodeCounts = await getDarknodeCountsPromise;
            updateDarknodeCounts(darknodeCounts);
        } catch (error) {
            // Ignore error
        }

        const {
            pendingRewards: newPendingRewards,
            currentCycle: newCurrentCycle,
            previousCycle: newPreviousCycle,
            cycleTimeout: newCycleTimeout,
            pendingTotalInEth: newPendingTotalInEth,
            pendingRewardsInEth: newPendingRewardsInEth,
            currentShareCount: newCurrentShareCount,
        } = await fetchCycleAndPendingRewardsPromise;

        if (newPendingRewardsInEth !== null) {
            setPendingRewardsInEth(newPendingRewardsInEth);
        }
        if (newPendingTotalInEth !== null) {
            setPendingTotalInEth(newPendingTotalInEth);
        }
        if (newCurrentCycle !== null && newCurrentCycle !== undefined) {
            setCurrentCycle(newCurrentCycle.toString());
        }
        if (newPreviousCycle !== null && newPreviousCycle !== undefined) {
            setPreviousCycle(newPreviousCycle.toString());
        }
        setPendingRewards(newPendingRewards);
        // tslint:disable-next-line: strict-type-predicates
        if (newCycleTimeout !== null) {
            setCycleTimeout(newCycleTimeout);
        }
        if (newCurrentShareCount !== null) {
            setCurrentShareCount(newCurrentShareCount);
        }
    };

    const updateDarknodeDetails = async (
        darknodeID: string,
    ) => {
        const details = await fetchDarknodeDetails(web3, renNetwork, darknodeID, tokenPrices);
        storeDarknodeDetails(details);
    };

    const updateOperatorDarknodes = async () => {
        // await updateCycleAndPendingRewards(web3, renNetwork, tokenPrices);

        if (!address) {
            return;
        }

        let newDarknodeList = OrderedSet<string>();
        if (darknodeRegisteringList.size > 0) {
            newDarknodeList = newDarknodeList.merge(darknodeRegisteringList.keySeq().toOrderedSet());
        }
        const accountDarknodeList = darknodeList.get(address);
        if (accountDarknodeList) {
            newDarknodeList = newDarknodeList.merge(accountDarknodeList);
        }

        const currentDarknodes = await getOperatorDarknodes(web3, renNetwork, address, (progress, target) => {
            if (darknodeList.size === 0) {
                setRegistrySync({ progress, target });
            }
        }); /* , (darknodeID) => {
                            addDarknode({ darknodeID, address, network: renNetwork.name });
                    }, ); */

        addDarknodes(currentDarknodes);

        // The lists are merged in the reducer as well, but we combine them again
        // before passing into `updateDarknodeDetails`
        currentDarknodes.map((darknodeID: string) => {
            if (!newDarknodeList.contains(darknodeID)) {
                newDarknodeList = newDarknodeList.add(darknodeID);
            }
            return null;
        });

        await Promise.all(newDarknodeList.toList().map(async (darknodeID: string) => {
            return updateDarknodeDetails(darknodeID);
        }).toArray());

        await Promise.all(newDarknodeList.toList().map(async (darknodeID: string) => {
            const details = darknodeDetails.get(darknodeID);
            if (details && details.registrationStatus === RegistrationStatus.Registered && details.operator.toLowerCase() !== NULL.toLowerCase()) {
                if (details.operator.toLowerCase() === address.toLowerCase()) {
                    // return addDarknode({ darknodeID, address, network: renNetwork.name });
                } else {
                    return removeRegisteringDarknode(darknodeID);
                }
            }
            return;
        }).toArray());

        if (newDarknodeList.size === 0) {
            storeEmptyDarknodeList();
        }
    };

    const showWithdrawToken = async (
        darknodeID: string,
        token: Token | OldToken,
    ) => new Promise(async (resolve, reject) => {
        const tokenDetails = AllTokenDetails.get(token);
        if (tokenDetails === undefined) {
            throw new Error("Unknown token");
        }

        if (!address) {
            throw new Error(`Unable to retrieve account address.`);
        }

        let shiftStatus = TxStatus.TxStatusNil;

        const onStatus = (status: TxStatus) => {
            shiftStatus = status;
        };

        const withdraw = withdrawToken(
            web3,
            renNetwork,
            address,
            darknodeID,
            token,
            waitForTX,
            onStatus,
        );
        const onCancel = () => {
            clearPopup();
            reject();
        };
        const onDone = () => {
            clearPopup();
            resolve();
        };
        if (tokenDetails.wrapped) {
            setPopup({
                popup: <WithdrawPopup
                    token={token as Token}
                    withdraw={withdraw}
                    onDone={onDone}
                    onCancel={onCancel}
                    status={shiftStatus}
                />,
                onCancel,
                overlay: true
            });
        } else {
            try {
                await withdraw();
                resolve();
            } catch (error) {
                onCancel();
            }
        }
    });

    const withdrawReward = (
        darknodeID: string,
        token: Token,
    ) => async () => {
        const tokenDetails = AllTokenDetails.get(token);
        if (tokenDetails === undefined) {
            throw new Error("Unknown token");
        }

        await showWithdrawToken(darknodeID, token);
    };


    const showRegisterPopup = async (
        darknodeID: string,
        publicKey: string,
        onCancel: () => void, onDone: () => void,
    ) => {
        if (!address) {
            throw new Error(`Unable to retrieve account address.`);
        }

        const minimumBond = await getMinimumBond(web3, renNetwork);

        const step1 = async () => {
            await approveNode(web3, renNetwork, address, minimumBond, waitForTX);
        };

        const step2 = async () => {
            await registerNode(
                web3,
                renNetwork,
                address,
                darknodeID,
                publicKey,
                minimumBond,
                onCancel,
                onDone,
                waitForTX,
            );

            if (tokenPrices) {
                try {
                    await updateDarknodeDetails(darknodeID);
                } catch (error) {
                    catchBackgroundException(error, "Error in operatorPopupActions > showRegisterPopup > updateDarknodeDetails");
                }
            }
        };

        const steps = [
            { call: step1, name: `Approve ${renNetwork.name === "chaosnet" ? "10K" : "100K"} REN` },
            { call: step2, name: "Register darknode" },
        ];

        // const warning = `Due to a large number of registrations, estimated Darknode profits are currently negative.\
        //         Are you sure you want to continue?`;
        const title = "Register darknode";

        setPopup({
            popup: <MultiStepPopup
                steps={steps}
                onCancel={onCancel}
                title={title}
                // warning={warning}
                confirm={false}
            />,
            onCancel,
            dismissible: false,
            overlay: true,
        });
    };

    const showDeregisterPopup = (
        darknodeID: string,
        remainingFees: BigNumber | null,
        onCancel: () => void,
        onDone: () => void,
    ) => {
        if (!address) {
            throw new Error(`Unable to retrieve account address.`);
        }

        const step1 = async () => {
            await deregisterNode(web3, renNetwork, address, darknodeID, onCancel, onDone, waitForTX);
        };

        const steps = [
            { call: step1, name: "Deregister darknode" },
        ];

        let warning;
        if (remainingFees && remainingFees.gt(0.00001)) {

            warning = <>
                You have earned
                {" "}
                <span style={{ fontWeight: 900 }}>
                    <CurrencyIcon currency={quoteCurrency} />
                    <TokenBalance token={Token.ETH} convertTo={quoteCurrency} amount={remainingFees} />
                    {quoteCurrency.toUpperCase()}
                </span>
                {" "}
                in fees. Please withdraw them before continuing.
            </>;
        }

        const ignoreWarning = "Continue away (fees will be lost)";
        const title = "Deregister darknode";

        setPopup(
            {
                popup: <MultiStepPopup
                    steps={steps}
                    onCancel={onCancel}
                    title={title}
                    ignoreWarning={ignoreWarning}
                    warning={warning}
                    confirm
                />,
                onCancel,
                dismissible: false,
                overlay: true,
            },
        );
    };

    const showRefundPopup = (
        darknodeID: string,
        onCancel: () => void,
        onDone: () => void,
    ) => {
        if (!address) {
            throw new Error(`Unable to retrieve account address.`);
        }

        const step1 = async () => {
            await refundNode(web3, renNetwork, address, darknodeID, onCancel, onDone, waitForTX);
        };

        const steps = [
            { call: step1, name: "Refund REN" },
        ];

        const title = "Refund REN";

        setPopup(
            {
                popup: <MultiStepPopup
                    steps={steps}
                    onCancel={onCancel}
                    title={title}
                    confirm={false}
                />,
                onCancel,
                dismissible: false,
                overlay: true,
            },
        );
    };

    const showFundPopup = (
        darknodeID: string,
        ethAmountStr: string,
        onCancel: () => void,
        onDone: () => void,
    ) => {
        if (!address) {
            throw new Error(`Unable to retrieve account address.`);
        }

        const step1 = async () => {
            await fundNode(web3, address, darknodeID, ethAmountStr, onCancel, onDone, waitForTX);
        };

        const steps = [
            { call: step1, name: "Fund darknode" },
        ];

        const title = "Fund darknode";

        setPopup(
            {
                popup: <MultiStepPopup
                    steps={steps}
                    onCancel={onCancel}
                    title={title}
                    confirm={false}
                />,
                onCancel,
                dismissible: false,
                overlay: true,
            },
        );
    };

    return {
        secondsPerBlock,
        tokenPrices,
        darknodeCount, setDarknodeCount,
        orderCount, setOrderCount,
        registrySync, setRegistrySync,
        darknodeDetails,
        balanceHistories, setBalanceHistories,
        transactions, setTransactions,
        confirmations, setConfirmations,
        currentCycle, setCurrentCycle,
        previousCycle, setPreviousCycle,
        pendingRewards, setPendingRewards,
        pendingTotalInEth, setPendingTotalInEth,
        pendingRewardsInEth, setPendingRewardsInEth,
        cycleTimeout, setCycleTimeout,
        currentShareCount, setCurrentShareCount,
        currentDarknodeCount, setCurrentDarknodeCount,
        previousDarknodeCount, setPreviousDarknodeCount,
        nextDarknodeCount, setNextDarknodeCount,
        quoteCurrency, setQuoteCurrency,
        darknodeNames, setDarknodeNames,
        darknodeRegisteringList, setDarknodeRegisteringList,
        darknodeList, setDarknodeList,
        hiddenDarknodes, setHiddenDarknodes,
        withdrawAddresses, setWithdrawAddresses,

        updateTokenPrices,
        updateSecondsPerBlock,
        updateDarknodeBalanceHistory,
        hideDarknode,
        unhideDarknode,
        updateDarknodeCounts,
        addDarknodes,
        storeEmptyDarknodeList,
        addRegisteringDarknode,
        removeRegisteringDarknode,
        addToWithdrawAddresses,
        removeFromWithdrawAddresses,
        storeDarknodeName,
        addTransaction,
        storeTxConfirmations,
        waitForTX,
        updateCycleAndPendingRewards,
        updateDarknodeDetails,
        updateOperatorDarknodes,
        showWithdrawToken,
        withdrawReward,
        showRegisterPopup,
        showDeregisterPopup,
        showRefundPopup,
        showFundPopup,
    };
};

export const NetworkStateContainer = createContainer(useNetworkStateContainer);
