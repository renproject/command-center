import { useApolloClient } from "@apollo/react-hooks";
import { Currency, CurrencyIcon, Record } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { List, Map, OrderedMap, OrderedSet } from "immutable";
import React, { useState } from "react";
import { createContainer } from "unstated-next";
import { PromiEvent } from "web3-core";

import { MultiStepPopup } from "../controllers/common/popups/MultiStepPopup";
import { WithdrawPopup } from "../controllers/common/popups/WithdrawPopup";
import { TokenBalance } from "../controllers/common/TokenBalance";
import { retryNTimes } from "../controllers/statsPages/renvmStatsPage/renvmContainer";
import { NodeStatistics } from "../lib/darknode/jsonrpc";
import { getDarknodePayment } from "../lib/ethereum/contract";
import {
    DarknodeFeeStatus,
    fetchDarknodeDetails,
    getOperatorDarknodes,
    NULL,
    RegistrationStatus,
    sumUpFeeMap,
} from "../lib/ethereum/contractReads";
import {
    approveNode,
    deregisterNode,
    fundNode,
    refundNode,
    registerNode,
    withdrawToken,
} from "../lib/ethereum/contractWrites";
import {
    AllTokenDetails,
    FeeTokens,
    getPrices,
    Token,
    TokenPrices,
} from "../lib/ethereum/tokens";
import { isDefined } from "../lib/general/isDefined";
import { safePromiseAllMap } from "../lib/general/promiseAll";
import { RenVM } from "../lib/graphQL/queries/renVM";
import {
    catchBackgroundException,
    catchInteractionException,
} from "../lib/react/errors";
import { GraphContainer } from "./graphContainer";
import { PopupContainer } from "./popupContainer";
import useStorageState from "./useStorageState/useStorageState";
import { Web3Container } from "./web3Container";

export class DarknodesState extends Record({
    ID: "",
    multiAddress: "",
    publicKey: "",
    ethBalance: null as BigNumber | null,
    feesEarned: OrderedMap<Token, BigNumber>(),
    feesEarnedTotalEth: null as BigNumber | null,

    cycleStatus: OrderedMap<string, DarknodeFeeStatus>(),

    averageGasUsage: 0,
    lastTopUp: null,
    expectedExhaustion: null,

    peers: 0,
    registrationStatus: "" as RegistrationStatus,
    operator: "",

    nodeStatistics: null as NodeStatistics | null,
}) {}

export type WaitForTX = <T>(
    promiEvent: PromiEvent<T>,
    onConfirmation?: (confirmations?: number) => void,
) => Promise<string>;

const useNetworkContainer = () => {
    const { web3, renNetwork, address } = Web3Container.useContainer();
    const { setPopup, clearPopup } = PopupContainer.useContainer();
    const { renVM, fetchRenVM } = GraphContainer.useContainer();
    const client = useApolloClient();

    const [tokenPrices, setTokenPrices] = useState(null as TokenPrices | null);

    const [registrySync, setRegistrySync] = useState({
        progress: 0,
        target: 0,
    });

    const [darknodeDetails, setDarknodeDetails] = useState(
        Map<string, DarknodesState>(),
    );

    // const [balanceHistories, setBalanceHistories] = useState(Map<string, OrderedMap<number, BigNumber>>());

    // tslint:disable-next-line: no-any
    const [transactions, setTransactions] = useState(
        OrderedMap<string, PromiEvent<any>>(),
    );
    const [confirmations, setConfirmations] = useState(
        OrderedMap<string, number>(),
    );

    const [pendingRewards, setPendingRewards] = useState(
        OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber | null>>(),
    );
    const [pendingTotalInEth, setPendingTotalInEth] = useState(
        OrderedMap<string /* cycle */, BigNumber | null>(),
    );
    const [pendingRewardsInEth, setPendingRewardsInEth] = useState(
        OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber | null>>(),
    );

    ///////////////////////////////////////////////////////////
    // If these change, localstorage migration may be needed //
    ///////////////////////////////////////////////////////////
    const [quoteCurrency, setQuoteCurrency] = useStorageState(
        localStorage,
        "quoteCurrency",
        Currency.USD,
    );
    const [darknodeNames, setDarknodeNames] = useStorageState(
        localStorage,
        "darknodeNames",
        Map<string, string>(),
        (s) => Map<string, string>(JSON.parse(s as string)),
    );
    const [
        darknodeRegisteringList,
        setDarknodeRegisteringList,
    ] = useStorageState(
        localStorage,
        "darknodeRegisteringList",
        Map<string, string>(),
        (s) => Map<string, string>(JSON.parse(s as string)),
    );
    // Map from operator-address to list of darknodes.
    const [darknodeList, setDarknodeList] = useStorageState(
        localStorage,
        "darknodeList",
        Map<string, OrderedSet<string>>(),
        (s) =>
            Map<string, OrderedSet<string>>(JSON.parse(s as string)).map((x) =>
                OrderedSet<string>(x),
            ),
    );
    const [hiddenDarknodes, setHiddenDarknodes] = useStorageState(
        localStorage,
        "hiddenDarknodes",
        Map<string, OrderedSet<string>>(),
        (s) =>
            Map<string, OrderedSet<string>>(JSON.parse(s as string)).map((x) =>
                OrderedSet<string>(x),
            ),
    );
    const [
        withdrawAddresses,
        setWithdrawAddresses,
    ] = useStorageState(
        localStorage,
        "withdrawAddresses",
        Map<Token, List<string>>(),
        (s) =>
            Map<Token, List<string>>(JSON.parse(s as string)).map((x) =>
                List<string>(x),
            ),
    );
    ///////////////////////////////////////////////////////

    const updateTokenPrices = async () => {
        try {
            setTokenPrices(await getPrices(tokenPrices));
        } catch (error) {
            catchBackgroundException(
                error,
                "Error in networkActions > updateTokenPrices",
            );
        }
    };

    const hideDarknode = (darknodeID: string, operator: string) => {
        try {
            let operatorHiddenDarknodes =
                hiddenDarknodes.get(operator) || OrderedSet<string>();

            operatorHiddenDarknodes = operatorHiddenDarknodes.add(darknodeID);

            setHiddenDarknodes((latestHiddenDarknodes) =>
                (latestHiddenDarknodes || Map()).set(
                    operator,
                    operatorHiddenDarknodes,
                ),
            );
        } catch (error) {
            catchInteractionException(
                error,
                "Error in networkReducer > removeDarknode",
            );
        }
    };

    const unhideDarknode = (darknodeID: string, operator: string) => {
        try {
            let operatorHiddenDarknodes =
                hiddenDarknodes.get(operator) || OrderedSet<string>();

            operatorHiddenDarknodes = operatorHiddenDarknodes.remove(
                darknodeID,
            );

            setHiddenDarknodes((latestHiddenDarknodes) =>
                (latestHiddenDarknodes || Map()).set(
                    operator,
                    operatorHiddenDarknodes,
                ),
            );
        } catch (error) {
            catchInteractionException(
                error,
                "Error in networkReducer > removeDarknode",
            );
        }
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
                newNames = newNames.set(
                    darknodeID,
                    `Darknode ${newList.toList().indexOf(darknodeID) + 1}`,
                );
            }
            return null;
        });

        const newDarknodeRegisteringList = darknodeRegisteringList.filter(
            (_: string, darknodeID: string) => !newList.contains(darknodeID),
        );

        setDarknodeList((latestDarknodeList) =>
            (latestDarknodeList || Map()).set(address, newList),
        );
        setDarknodeNames(newNames);
        setDarknodeRegisteringList(newDarknodeRegisteringList);
    };

    const storeEmptyDarknodeList = () => {
        if (address) {
            setDarknodeList((latestDarknodeList) =>
                (latestDarknodeList || Map()).set(address, OrderedSet()),
            );
        }
    };

    const addRegisteringDarknode = (darknodeID: string, publicKey: string) => {
        setDarknodeRegisteringList((latestDarknodeRegisteringList) =>
            (latestDarknodeRegisteringList || Map()).set(darknodeID, publicKey),
        );
    };

    const removeRegisteringDarknode = (darknodeID: string) => {
        return setDarknodeRegisteringList((latestDarknodeRegisteringList) =>
            (latestDarknodeRegisteringList || Map()).remove(darknodeID),
        );
    };

    const addToWithdrawAddresses = (token: Token, withdrawAddress: string) => {
        const foundList = withdrawAddresses.get(token, List());
        if (foundList.contains(withdrawAddress)) {
            return;
        }
        return setWithdrawAddresses((latestWithdrawAddresses) =>
            (latestWithdrawAddresses || Map()).set(
                token,
                foundList.push(withdrawAddress),
            ),
        );
    };
    const removeFromWithdrawAddresses = (
        token: Token,
        withdrawAddress: string,
    ) => {
        const list = withdrawAddresses.get(token);
        if (!list) {
            return;
        }
        const foundIndex = list.findIndex((addr) => addr === withdrawAddress);
        if (foundIndex === -1) {
            return;
        }
        return setWithdrawAddresses((latestWithdrawAddresses) =>
            (latestWithdrawAddresses || Map()).set(
                token,
                list.remove(foundIndex),
            ),
        );
    };

    const storeDarknodeDetails = (details: DarknodesState) => {
        return setDarknodeDetails((latestDarknodeDetails) =>
            latestDarknodeDetails.set(details.ID, details),
        );
    };

    const storeDarknodeName = (darknodeID: string, name: string) => {
        return setDarknodeNames((latestDarknodeNames) =>
            (latestDarknodeNames || Map()).set(darknodeID, name),
        );
    };

    // tslint:disable-next-line: no-any
    const addTransaction = (txHash: string, tx: PromiEvent<any>) => {
        return setTransactions((latestTransactions) =>
            latestTransactions.set(txHash, tx),
        );
    };
    const storeTxConfirmations = (
        txHash: string,
        numberOfConfirmations: number,
    ) => {
        return setConfirmations((latestConfirmations) =>
            latestConfirmations.set(txHash, numberOfConfirmations),
        );
    };

    const waitForTX = async <T extends {}>(
        promiEvent: PromiEvent<T>,
        onConfirmation?: (confirmations?: number) => void,
    ) =>
        new Promise<string>((resolve, reject) => {
            promiEvent
                .on("transactionHash", (txHash) => {
                    resolve(txHash);
                    addTransaction(txHash, promiEvent);
                    promiEvent.on("confirmation", (numberOfConfirmations) => {
                        storeTxConfirmations(txHash, numberOfConfirmations);
                    });
                    promiEvent.once("confirmation", (numberOfConfirmations) => {
                        if (onConfirmation) {
                            onConfirmation(numberOfConfirmations);
                        }
                    });
                    promiEvent.on("error", (error) => {
                        storeTxConfirmations(txHash, -1);
                        reject(error);
                    });
                })
                .catch(reject);
        });

    /**
     * Retrieves information about the pending rewards in the Darknode Payment
     * contract.
     *
     * @returns `{
     *     pendingRewards: For each cycle, a map from tokens to rewards
     *     currentCycle: The current cycle (as a block number)
     *     previousCycle: The previous cycle (as a block number)
     *     cycleTimeout: The earliest the current cycle could end (as a block number)
     *     pendingTotalInEth: For each cycle, The pending rewards added up as ETH
     * }`
     */
    const fetchCycleAndPendingRewards = async (latestRenVM: RenVM) => {
        const darknodePayment = getDarknodePayment(web3, renNetwork);

        let newPendingRewards = OrderedMap<
            string /* cycle */,
            OrderedMap<Token, BigNumber | null>
        >();

        const πPrevious = safePromiseAllMap(
            FeeTokens.map(async (_tokenDetails, token) => {
                try {
                    const tokenAddress =
                        token === Token.ETH
                            ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
                            : renNetwork.addresses.tokens[token].address;
                    if (renVM && token === Token.BTC)
                        return renVM.currentEpoch.rewardShareBTC.decimalPlaces(
                            0,
                        );
                    if (renVM && token === Token.ZEC)
                        return renVM.currentEpoch.rewardShareZEC.decimalPlaces(
                            0,
                        );
                    if (renVM && token === Token.BCH)
                        return renVM.currentEpoch.rewardShareBCH.decimalPlaces(
                            0,
                        );
                    const previousCycleRewardShareBN = await retryNTimes(
                        async () =>
                            await darknodePayment.methods
                                .previousCycleRewardShare(tokenAddress)
                                .call(/**/),
                        2,
                    );
                    return new BigNumber(
                        (
                            previousCycleRewardShareBN || new BigNumber(0)
                        ).toString(),
                    ).decimalPlaces(0);
                } catch (error) {
                    console.error(`Error fetching rewards for ${token}`, error);
                    return new BigNumber(0);
                }
            }).toOrderedMap(),
            new BigNumber(0),
        );

        const πCurrent = safePromiseAllMap(
            FeeTokens.map(async (_tokenDetails, token) => {
                if (latestRenVM.numberOfDarknodes.isZero()) {
                    return new BigNumber(0);
                }
                try {
                    const tokenAddress =
                        token === Token.ETH
                            ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
                            : renNetwork.addresses.tokens[token].address;
                    const currentCycleRewardPool = await retryNTimes(
                        async () =>
                            await darknodePayment.methods
                                .currentCycleRewardPool(tokenAddress)
                                .call(),
                        2,
                    );
                    if (currentCycleRewardPool === null) {
                        return new BigNumber(0);
                    }
                    return new BigNumber(currentCycleRewardPool.toString())
                        .decimalPlaces(0)
                        .div(latestRenVM.numberOfDarknodes)
                        .decimalPlaces(0);
                } catch (error) {
                    console.error(`Error fetching rewards for ${token}`, error);
                    return null;
                }
            }).toOrderedMap(),
            null,
        );

        const previous = await πPrevious;
        if (isDefined(latestRenVM)) {
            newPendingRewards = newPendingRewards.set(
                latestRenVM.previousCycle,
                previous,
            );
        }

        const current = await πCurrent;
        if (isDefined(latestRenVM)) {
            newPendingRewards = newPendingRewards.set(
                latestRenVM.currentCycle,
                current,
            );
        }

        let newPendingTotalInEth = null;
        let newPendingRewardsInEth = null;
        if (tokenPrices) {
            const [previousTotal, previousInEth] = sumUpFeeMap(
                previous,
                tokenPrices,
            );
            const [currentTotal, currentInEth] = sumUpFeeMap(
                current,
                tokenPrices,
            );
            newPendingTotalInEth = OrderedMap<
                string /* cycle */,
                BigNumber | null
            >();
            newPendingRewardsInEth = OrderedMap<
                string /* cycle */,
                OrderedMap<Token, BigNumber | null>
            >();
            if (isDefined(latestRenVM)) {
                newPendingTotalInEth = newPendingTotalInEth.set(
                    latestRenVM.previousCycle,
                    previousTotal,
                );
                newPendingRewardsInEth = newPendingRewardsInEth.set(
                    latestRenVM.previousCycle,
                    previousInEth,
                );
                newPendingTotalInEth = newPendingTotalInEth.set(
                    latestRenVM.currentCycle,
                    currentTotal,
                );
                newPendingRewardsInEth = newPendingRewardsInEth.set(
                    latestRenVM.currentCycle,
                    currentInEth,
                );
            }
        }

        return {
            newPendingRewards,
            newPendingTotalInEth,
            newPendingRewardsInEth,
        };
    };

    const updateCycleAndPendingRewards = async () => {
        if (!renVM) {
            return;
        }
        const fetchCycleAndPendingRewardsPromise = fetchCycleAndPendingRewards(
            renVM,
        );

        const {
            newPendingRewards,
            newPendingTotalInEth,
            newPendingRewardsInEth,
        } = await fetchCycleAndPendingRewardsPromise;

        if (isDefined(newPendingRewardsInEth)) {
            setPendingRewardsInEth(newPendingRewardsInEth);
        }
        if (isDefined(newPendingTotalInEth)) {
            setPendingTotalInEth(newPendingTotalInEth);
        }
        setPendingRewards(newPendingRewards);
    };

    const updateDarknodeDetails = async (
        darknodeID: string,
        latestRenVM?: RenVM,
    ) => {
        const latestRenVMOrNull = latestRenVM || (await fetchRenVM());
        if (latestRenVMOrNull) {
            const details = await fetchDarknodeDetails(
                client,
                latestRenVMOrNull,
                web3,
                renNetwork,
                darknodeID,
                tokenPrices,
            );
            storeDarknodeDetails(details);
        }
    };

    const updateOperatorDarknodes = async (
        selectedDarknode?: string | undefined,
    ) => {
        if (!address) {
            return;
        }

        let newDarknodeList = OrderedSet<string>();
        if (darknodeRegisteringList.size > 0) {
            newDarknodeList = newDarknodeList.merge(
                darknodeRegisteringList.keySeq().toOrderedSet(),
            );
        }
        const accountDarknodeList = darknodeList.get(address);
        if (accountDarknodeList) {
            newDarknodeList = newDarknodeList.merge(accountDarknodeList);
        }

        const currentDarknodes = await getOperatorDarknodes(
            web3,
            renNetwork,
            address,
            (progress, target) => {
                if (darknodeList.size === 0) {
                    setRegistrySync({ progress, target });
                }
            },
        ); /* , (darknodeID) => {
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

        const latestRenVM = await fetchRenVM();
        if (!latestRenVM) {
            throw new Error("Unable to load network status");
        }
        await Promise.all(
            newDarknodeList
                .toList()
                .map(async (darknodeID: string) => {
                    // The selected darknode is updated in a different background loop.
                    if (darknodeID === selectedDarknode) {
                        return;
                    }
                    return updateDarknodeDetails(darknodeID, latestRenVM);
                })
                .toArray(),
        );

        await Promise.all(
            newDarknodeList
                .toList()
                .map(async (darknodeID: string) => {
                    const details = darknodeDetails.get(darknodeID);
                    if (
                        details &&
                        details.registrationStatus ===
                            RegistrationStatus.Registered &&
                        details.operator.toLowerCase() !== NULL.toLowerCase()
                    ) {
                        if (
                            details.operator.toLowerCase() ===
                            address.toLowerCase()
                        ) {
                            // return addDarknode({ darknodeID, address, network: renNetwork.name });
                        } else {
                            return removeRegisteringDarknode(darknodeID);
                        }
                    }
                    return;
                })
                .toArray(),
        );

        if (newDarknodeList.size === 0) {
            storeEmptyDarknodeList();
        }
    };

    const withdrawReward = async (darknodeID: string, token: Token) =>
        new Promise(async (resolve, reject) => {
            const tokenDetails = AllTokenDetails.get(token);
            if (tokenDetails === undefined) {
                throw new Error("Unknown token");
            }

            if (!address) {
                throw new Error(`Unable to retrieve account address.`);
            }

            const withdraw = withdrawToken(
                web3,
                renNetwork,
                address,
                darknodeID,
                token,
                waitForTX,
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
                    popup: (
                        <WithdrawPopup
                            token={token}
                            withdraw={withdraw}
                            onDone={onDone}
                            onCancel={onCancel}
                        />
                    ),
                    onCancel,
                    overlay: true,
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

    const showRegisterPopup = async (
        web3Address: string,
        darknodeID: string,
        publicKey: string,
        onCancel: () => void,
        onDone: () => void,
    ) => {
        if (!web3Address) {
            throw new Error(`Unable to retrieve account address.`);
        }
        if (!renVM) {
            throw new Error(
                `Unable to register - unable to fetch minimum bond.`,
            );
        }

        const step1 = async () => {
            await approveNode(
                web3,
                renNetwork,
                web3Address,
                renVM.minimumBond,
                waitForTX,
            );
        };

        const step2 = async () => {
            await registerNode(
                web3,
                renNetwork,
                web3Address,
                darknodeID,
                publicKey,
                renVM.minimumBond,
                onCancel,
                onDone,
                waitForTX,
            );

            if (tokenPrices) {
                try {
                    await updateDarknodeDetails(darknodeID);
                } catch (error) {
                    catchBackgroundException(
                        error,
                        "Error in operatorPopupActions > showRegisterPopup > updateDarknodeDetails",
                    );
                }
            }
        };

        const steps = [
            {
                call: step1,
                name: `Approve ${
                    renNetwork.name === "chaosnet" ? "10K" : "100K"
                } REN`,
            },
            { call: step2, name: "Register darknode" },
        ];

        // const warning = `Due to a large number of registrations, estimated Darknode profits are currently negative.\
        //         Are you sure you want to continue?`;
        const title = "Register darknode";

        setPopup({
            popup: (
                <MultiStepPopup
                    steps={steps}
                    onCancel={onCancel}
                    title={title}
                    // warning={warning}
                    confirm={false}
                />
            ),
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
            await deregisterNode(
                web3,
                renNetwork,
                address,
                darknodeID,
                onCancel,
                onDone,
                waitForTX,
            );
        };

        const steps = [{ call: step1, name: "Deregister darknode" }];

        let warning;
        if (remainingFees && remainingFees.gt(0.00001)) {
            warning = (
                <>
                    You have earned{" "}
                    <span style={{ fontWeight: 900 }}>
                        <CurrencyIcon currency={quoteCurrency} />
                        <TokenBalance
                            token={Token.ETH}
                            convertTo={quoteCurrency}
                            amount={remainingFees}
                        />
                        {quoteCurrency.toUpperCase()}
                    </span>{" "}
                    in fees. Please withdraw them before continuing.
                </>
            );
        }

        const ignoreWarning = "Continue away (fees will be lost)";
        const title = "Deregister darknode";

        setPopup({
            popup: (
                <MultiStepPopup
                    steps={steps}
                    onCancel={onCancel}
                    title={title}
                    ignoreWarning={ignoreWarning}
                    warning={warning}
                    confirm
                />
            ),
            onCancel,
            dismissible: false,
            overlay: true,
        });
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
            await refundNode(
                web3,
                renNetwork,
                address,
                darknodeID,
                onCancel,
                onDone,
                waitForTX,
            );
        };

        const steps = [{ call: step1, name: "Refund REN" }];

        const title = "Refund REN";

        setPopup({
            popup: (
                <MultiStepPopup
                    steps={steps}
                    onCancel={onCancel}
                    title={title}
                    confirm={false}
                />
            ),
            onCancel,
            dismissible: false,
            overlay: true,
        });
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
            await fundNode(
                web3,
                address,
                darknodeID,
                ethAmountStr,
                onCancel,
                onDone,
                waitForTX,
            );
        };

        const steps = [{ call: step1, name: "Fund darknode" }];

        const title = "Fund darknode";

        setPopup({
            popup: (
                <MultiStepPopup
                    steps={steps}
                    onCancel={onCancel}
                    title={title}
                    confirm={false}
                />
            ),
            onCancel,
            dismissible: false,
            overlay: true,
        });
    };

    return {
        tokenPrices,
        registrySync,
        darknodeDetails,
        transactions,
        setTransactions,
        confirmations,
        pendingRewards,
        pendingTotalInEth,
        pendingRewardsInEth,
        quoteCurrency,
        setQuoteCurrency,
        darknodeNames,
        darknodeRegisteringList,
        darknodeList,
        hiddenDarknodes,
        withdrawAddresses,

        updateTokenPrices,
        hideDarknode,
        unhideDarknode,
        addRegisteringDarknode,
        removeRegisteringDarknode,
        addToWithdrawAddresses,
        removeFromWithdrawAddresses,
        storeDarknodeName,
        waitForTX,
        updateCycleAndPendingRewards,
        updateDarknodeDetails,
        updateOperatorDarknodes,
        withdrawReward,
        showRegisterPopup,
        showDeregisterPopup,
        showRefundPopup,
        showFundPopup,
    };
};

export const NetworkContainer = createContainer(useNetworkContainer);
