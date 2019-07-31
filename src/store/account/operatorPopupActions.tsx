import * as React from "react";
import {} from "redux";

import { RenNetworkDetails } from "@renproject/contracts";
import { Currency, CurrencyIcon } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import Web3 from "web3";

import { MultiStepPopup } from "../../components/popups/MultiStepPopup";
import { TokenBalance } from "../../components/TokenBalance";
import { getMinimumBond } from "../../lib/ethereum/contractReads";
import {
    approveNode, changeCycle, claimForNode, deregisterNode, fundNode, refundNode, registerNode,
} from "../../lib/ethereum/contractWrites";
import { Token } from "../../lib/ethereum/tokens";
import { connectWaitForTX } from "../../lib/ethereum/waitForTX";
import { _captureBackgroundException_ } from "../../lib/react/errors";
import { TokenPrices } from "../../lib/tokenPrices";
import { updateDarknodeDetails } from "../network/operatorActions";
import { setPopup } from "../popup/popupActions";
import { AppDispatch } from "../rootReducer";

export const showRegisterPopup = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    darknodeID: string,
    publicKey: string,
    tokenPrices: TokenPrices, onCancel: () => void, onDone: () => void) => async (dispatch: AppDispatch) => {

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
                    _captureBackgroundException_(error, {
                        description: "Error thrown in updateDarknodeDetails in showRegisterPopup",
                    });
                }
            }
        };

        const steps = [
            { call: step1, name: "Approve 100'000 REN" },
            { call: step2, name: "Register darknode" },
        ];

        const warning = `Due to a large number of registrations, estimated Darknode profits are currently negative.\
Are you sure you want to continue?`;
        const title = "Register darknode";

        dispatch(setPopup({
            popup: <MultiStepPopup
                steps={steps}
                onCancel={onCancel}
                title={title}
                confirm={true}
                warning={warning}
            />,
            onCancel,
            dismissible: false,
            overlay: true,
        }));
    };

export const showDeregisterPopup = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    darknodeID: string,
    remainingFees: BigNumber | null,
    quoteCurrency: Currency,
    onCancel: () => void,
    onDone: () => void
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

    dispatch(setPopup(
        {
            popup: <MultiStepPopup
                steps={steps}
                onCancel={onCancel}
                title={title}
                confirm={true}
                ignoreWarning={ignoreWarning}
                warning={warning}
            />,
            onCancel,
            dismissible: false,
            overlay: true,
        },
    ));
};

export const showRefundPopup = (
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

    dispatch(setPopup(
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
    ));
};

export const showFundPopup = (
    web3: Web3,
    address: string,
    darknodeID: string,
    ethAmountStr: string,
    onCancel: () => void,
    onDone: () => void,
) => async (dispatch: AppDispatch) => {

    const step1 = async () => {
        await fundNode(web3, address, darknodeID, ethAmountStr, onCancel, onDone, connectWaitForTX(dispatch));
    };

    const steps = [
        { call: step1, name: "Fund darknode" },
    ];

    const title = "Fund darknode";

    dispatch(setPopup(
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
    ));
};

export const showClaimPopup = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    claimBeforeCycle: boolean,
    address: string,
    darknodeID: string,
    title: string,
    onCancel: () => void,
    onDone: () => void,
) => async (dispatch: AppDispatch) => {

    const useFixedGasLimit = !claimBeforeCycle;

    const claimStep = {
        call: async () => {
            await claimForNode(web3, renNetwork, useFixedGasLimit, address, darknodeID, onCancel, onDone, connectWaitForTX(dispatch));
        },
        name: "Claim rewards",
    };

    const ignoreError = claimBeforeCycle;
    const changeCycleStep = {
        call: async () => {
            await changeCycle(web3, renNetwork, ignoreError, address, onCancel, onDone, connectWaitForTX(dispatch));
        },
        name: `Change cycle${claimBeforeCycle ? " (optional)" : ""}`,
    };

    const step1 = claimBeforeCycle ? claimStep : changeCycleStep;
    const step2 = claimBeforeCycle ? changeCycleStep : claimStep;

    const steps = [step1, step2];

    dispatch(setPopup(
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
    ));
};
