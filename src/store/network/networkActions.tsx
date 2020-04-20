import * as React from "react";

import { RenNetworkDetails } from "@renproject/contracts";
import { TxStatus } from "@renproject/interfaces";
import { Currency, CurrencyIcon } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { OrderedMap, OrderedSet } from "immutable";
import { createAction } from "typesafe-actions";
import Web3 from "web3";
import { PromiEvent } from "web3-core";

import { MultiStepPopup } from "../../components/common/popups/MultiStepPopup";
import { WithdrawPopup } from "../../components/common/popups/WithdrawPopup";
import { TokenBalance } from "../../components/common/TokenBalance";
import {
    DarknodeCounts, fetchCycleAndPendingRewards, fetchDarknodeDetails, getDarknodeCounts,
    getMinimumBond, getOperatorDarknodes, NULL, RegistrationStatus,
} from "../../lib/ethereum/contractReads";
import {
    approveNode, deregisterNode, fundNode, refundNode, registerNode, withdrawToken,
} from "../../lib/ethereum/contractWrites";
import { AllTokenDetails, OldToken, Token, TokenPrices } from "../../lib/ethereum/tokens";
import { connectWaitForTX, WaitForTX } from "../../lib/ethereum/waitForTX";
import { _catchBackgroundException_ } from "../../lib/react/errors";
import { ApplicationState, DarknodesState } from "../applicationState";
import { PopupDetails } from "../popupStore";
import { AppDispatch } from "../rootReducer";

export const updateCurrentCycle = createAction("UPDATE_CURRENT_CYCLE")<string>();
export const updatePreviousCycle = createAction("UPDATE_PREVIOUS_CYCLE")<string>();

export const updatePendingRewards = createAction("UPDATE_PENDING_REWARDS")<OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>>();
export const updatePendingTotalInEth = createAction("UPDATE_PENDING_TOTAL_IN_ETH")<OrderedMap<string /* cycle */, BigNumber>>();
export const updatePendingRewardsInEth = createAction("UPDATE_PENDING_REWARDS_IN_ETH")<OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>>();
export const updateCycleTimeout = createAction("UPDATE_CYCLE_TIMEOUT")<BigNumber>();
export const updateCurrentShareCount = createAction("UPDATE_CURRENT_SHARE_COUNT")<BigNumber>();
export const updateDarknodeCounts = createAction("UPDATE_DARKNODE_COUNTS")<DarknodeCounts>();

export const addRegisteringDarknode = createAction("ADD_REGISTERING_DARKNODE")<{
    darknodeID: string;
    publicKey: string;
}>();

export const removeRegisteringDarknode = createAction("REMOVE_REGISTERING_DARKNODE")<{
    darknodeID: string;
}>();

export const addDarknodes = createAction("ADD_DARKNODE")<{
    darknodes: OrderedSet<string>;
    address: string;
    network: string;
}>();

export const setEmptyDarknodeList = createAction("SET_EMPTY_DARKNODE_LIST")<{
    address: string;
    network: string;
}>();

export const storeQuoteCurrency = createAction("STORE_QUOTE_CURRENCY")<{ quoteCurrency: Currency }>();

export const storeRegistrySync = createAction("STORE_REGISTRY_SYNC")<{ progress: number, target: number }>();

export const storeSecondsPerBlock = createAction("STORE_SECONDS_PER_BLOCK")<{ secondsPerBlock: number }>();

export const addToWithdrawAddresses = createAction("ADD_TO_WITHDRAW_ADDRESSES")<{ token: Token, address: string }>();
export const removeFromWithdrawAddresses = createAction("REMOVE_FROM_WITHDRAW_ADDRESSES")<{ token: Token, address: string }>();

export const setDarknodeDetails = createAction("SET_DARKNODE_DETAILS")<{
    darknodeDetails: DarknodesState;
}>();

export const updateDarknodeHistory = createAction("UPDATE_DARKNODE_HISTORY")<{
    darknodeID: string;
    balanceHistory: OrderedMap<number, BigNumber>;
}>();

export const setDarknodeName = createAction("SET_DARKNODE_NAME")<{ darknodeID: string; name: string }>();

// tslint:disable-next-line: no-any
export const addTransaction = createAction("ADD_TRANSACTION")<{ txHash: string; tx: PromiEvent<any> }>();
export const setTxConfirmations = createAction("SET_TX_CONFIRMATIONS")<{ txHash: string; confirmations: number }>();

export const updateCycleAndPendingRewards = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    tokenPrices: TokenPrices | null,
) => async (dispatch: AppDispatch) => {
    const getDarknodeCountsPromise = getDarknodeCounts(web3, renNetwork);
    const fetchCycleAndPendingRewardsPromise = fetchCycleAndPendingRewards(web3, renNetwork, tokenPrices);

    try {
        const darknodeCounts = await getDarknodeCountsPromise;
        dispatch(updateDarknodeCounts(darknodeCounts));
    } catch (error) {
        // Ignore error
    }

    const {
        pendingRewards,
        currentCycle,
        previousCycle,
        cycleTimeout,
        pendingTotalInEth,
        pendingRewardsInEth,
        currentShareCount,
    } = await fetchCycleAndPendingRewardsPromise;

    if (pendingRewardsInEth !== null) {
        dispatch(updatePendingRewardsInEth(pendingRewardsInEth));
    }
    if (pendingTotalInEth !== null) {
        dispatch(updatePendingTotalInEth(pendingTotalInEth));
    }
    if (currentCycle !== null && currentCycle !== undefined) {
        dispatch(updateCurrentCycle(currentCycle.toString()));
    }
    if (previousCycle !== null && previousCycle !== undefined) {
        dispatch(updatePreviousCycle(previousCycle.toString()));
    }
    dispatch(updatePendingRewards(pendingRewards));
    // tslint:disable-next-line: strict-type-predicates
    if (cycleTimeout !== null) {
        dispatch(updateCycleTimeout(cycleTimeout));
    }
    if (currentShareCount !== null) {
        dispatch(updateCurrentShareCount(currentShareCount));
    }
};

export const updateDarknodeDetails = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    darknodeID: string,
    tokenPrices: TokenPrices | null,
) => async (dispatch: AppDispatch) => {
    const darknodeDetails = await fetchDarknodeDetails(web3, renNetwork, darknodeID, tokenPrices);
    dispatch(setDarknodeDetails({ darknodeDetails }));
};

export const updateOperatorDarknodes = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    tokenPrices: TokenPrices | null,
    previousDarknodeList: OrderedSet<string> | null,
) => async (dispatch: AppDispatch, getState: () => ApplicationState) => {
    // await dispatch(updateCycleAndPendingRewards(web3, renNetwork, tokenPrices));

    let darknodeList = previousDarknodeList || OrderedSet<string>();

    const currentDarknodes = await getOperatorDarknodes(web3, renNetwork, address, (progress, target) => {
        if (previousDarknodeList === null) {
            dispatch(storeRegistrySync({ progress, target }));
        }
    }); /* , (darknodeID) => {
        dispatch(addDarknode({ darknodeID, address, network: renNetwork.name }));
    }, ); */

    dispatch(addDarknodes({ darknodes: currentDarknodes, address, network: renNetwork.name }));

    // The lists are merged in the reducer as well, but we combine them again
    // before passing into `updateDarknodeDetails`
    currentDarknodes.map((darknodeID: string) => {
        if (!darknodeList.contains(darknodeID)) {
            darknodeList = darknodeList.add(darknodeID);
        }
        return null;
    });

    await Promise.all(darknodeList.toList().map(async (darknodeID: string) => {
        return dispatch(updateDarknodeDetails(web3, renNetwork, darknodeID, tokenPrices));
    }).toArray());

    const { darknodeDetails } = getState().network;

    await Promise.all(darknodeList.toList().map(async (darknodeID: string) => {
        const details = darknodeDetails.get(darknodeID);
        if (details && details.registrationStatus === RegistrationStatus.Registered && details.operator.toLowerCase() !== NULL.toLowerCase()) {
            if (details.operator.toLowerCase() === address.toLowerCase()) {
                // return dispatch(addDarknode({ darknodeID, address, network: renNetwork.name }));
            } else {
                return dispatch(removeRegisteringDarknode({ darknodeID }));
            }
        }
        return;
    }).toArray());

    if (darknodeList.size === 0) {
        dispatch(setEmptyDarknodeList({ address, network: renNetwork.name }));
    }
};

export const showWithdrawToken = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string | null,
    darknodeID: string,
    token: Token | OldToken,
    waitForTX: WaitForTX,
    callClearPopup: () => void,
    callSetPopup: (
        popup: JSX.Element,
        onCancel: () => void,
    ) => void,
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
        callClearPopup();
        reject();
    };
    const onDone = () => {
        callClearPopup();
        resolve();
    };
    if (tokenDetails.wrapped) {
        callSetPopup(
            <WithdrawPopup
                token={token as Token}
                withdraw={withdraw}
                onDone={onDone}
                onCancel={onCancel}
                status={shiftStatus}
            />,
            onCancel,
        );
    } else {
        try {
            await withdraw();
            resolve();
        } catch (error) {
            onCancel();
        }
    }
});

export const withdrawReward = (
    web3: Web3,
    address: string,
    renNetwork: RenNetworkDetails,
    darknodeID: string,
    token: Token,
    waitForTX: WaitForTX,
    setPopup: (details: PopupDetails) => void,
    clearPopup: () => void,
) => async () => {
    const tokenDetails = AllTokenDetails.get(token);
    if (tokenDetails === undefined) {
        throw new Error("Unknown token");
    }

    const callClearPopup = () => { clearPopup(); };
    const callSetPopup = (
        popup: JSX.Element,
        onCancel: () => void,
    ) => setPopup({ popup, overlay: true, onCancel });
    await showWithdrawToken(web3, renNetwork, address, darknodeID, token, waitForTX, callClearPopup, callSetPopup);
};


export const showRegisterPopup = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    darknodeID: string,
    publicKey: string,
    tokenPrices: TokenPrices, onCancel: () => void, onDone: () => void,
    setPopup: (details: PopupDetails) => void,
) => async (dispatch: AppDispatch) => {

    const minimumBond = await getMinimumBond(web3, renNetwork);

    const step1 = async () => {
        await approveNode(web3, renNetwork, address, minimumBond, connectWaitForTX(dispatch));
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
            connectWaitForTX(dispatch),
        );

        if (tokenPrices) {
            try {
                await dispatch(updateDarknodeDetails(web3, renNetwork, darknodeID, tokenPrices));
            } catch (error) {
                _catchBackgroundException_(error, "Error in operatorPopupActions > showRegisterPopup > updateDarknodeDetails");
            }
        }
    };

    const steps = [
        { call: step1, name: `Approve ${renNetwork.name === "chaosnet" ? "10K" : "100K"} REN` },
        { call: step2, name: "Register darknode" },
    ];

    const warning = `Due to a large number of registrations, estimated Darknode profits are currently negative.\
Are you sure you want to continue?`;
    const title = "Register darknode";

    setPopup({
        popup: <MultiStepPopup
            steps={steps}
            onCancel={onCancel}
            title={title}
            warning={warning}
            confirm
        />,
        onCancel,
        dismissible: false,
        overlay: true,
    });
};

export const showDeregisterPopup = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    darknodeID: string,
    remainingFees: BigNumber | null,
    quoteCurrency: Currency,
    onCancel: () => void,
    onDone: () => void,
    setPopup: (details: PopupDetails) => void,
) => async (dispatch: AppDispatch) => {

    const step1 = async () => {
        await deregisterNode(web3, renNetwork, address, darknodeID, onCancel, onDone, connectWaitForTX(dispatch));
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

export const showRefundPopup = (
    setPopup: (details: PopupDetails) => void,
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    darknodeID: string,
    onCancel: () => void,
    onDone: () => void,
) => async (dispatch: AppDispatch) => {

    const step1 = async () => {
        await refundNode(web3, renNetwork, address, darknodeID, onCancel, onDone, connectWaitForTX(dispatch));
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

export const showFundPopup = (
    web3: Web3,
    address: string,
    darknodeID: string,
    ethAmountStr: string,
    onCancel: () => void,
    onDone: () => void,
    setPopup: (details: PopupDetails) => void,
) => async (dispatch: AppDispatch) => {

    const step1 = async () => {
        await fundNode(web3, address, darknodeID, ethAmountStr, onCancel, onDone, connectWaitForTX(dispatch));
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
