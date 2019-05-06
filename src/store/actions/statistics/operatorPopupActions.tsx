import * as React from "react";

import BigNumber from "bignumber.js";
import Web3 from "web3";

import { Dispatch } from "redux";

import { CurrencyIcon } from "../../../components/CurrencyIcon";
import { MultiStepPopup } from "../../../components/popups/MultiStepPopup";
import { TokenBalance } from "../../../components/TokenBalance";
import { _captureBackgroundException_ } from "../../../lib/errors";
import { Token } from "../../../lib/ethereum/tokens";
import { Currency, EthNetwork, TokenPrices } from "../../types";
import { setPopup } from "../popup/popupActions";
import { approveNode, claimForNode, deregisterNode, fundNode, refundNode, registerNode } from "../trader/darknode";
import { updateDarknodeStatistics } from "./operatorActions";

export const showRegisterPopup = (
    web3: Web3,
    ethNetwork: EthNetwork,
    address: string,
    darknodeID: string,
    publicKey: string,
    minimumBond: BigNumber,
    tokenPrices: TokenPrices, onCancel: () => void, onDone: () => void) => async (dispatch: Dispatch) => {

        const step1 = async () => {
            await approveNode(web3, ethNetwork, address, minimumBond)(dispatch);
        };

        const step2 = async () => {
            await registerNode(
                web3,
                ethNetwork,
                address,
                darknodeID,
                publicKey,
                minimumBond || new BigNumber(100000),
                onCancel,
                onDone
            )(dispatch);

            if (tokenPrices) {
                try {
                    await updateDarknodeStatistics(web3, ethNetwork, darknodeID, tokenPrices)(dispatch);
                } catch (error) {
                    _captureBackgroundException_(error, {
                        description: "Error thrown in updateDarknodeStatistics in showRegisterPopup",
                    });
                }
            }
        };

        const steps = [
            { call: step1, name: "Approve 100'000 REN" },
            { call: step2, name: "Register darknode" },
        ];

        const warning = "Due to a large number of registrations, estimated Darknode profits are currently negative. \
Are you sure you want to continue?";
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
    ethNetwork: EthNetwork,
    address: string,
    darknodeID: string,
    remainingFees: BigNumber | null,
    quoteCurrency: Currency,
    onCancel: () => void,
    onDone: () => void
) => async (dispatch: Dispatch) => {

    const step1 = async () => {
        await deregisterNode(web3, ethNetwork, address, darknodeID, onCancel, onDone)(dispatch);
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
    ethNetwork: EthNetwork,
    address: string,
    darknodeID: string,
    onCancel: () => void,
    onDone: () => void,
) => async (dispatch: Dispatch) => {

    const step1 = async () => {
        await refundNode(web3, ethNetwork, address, darknodeID, onCancel, onDone)(dispatch);
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
) => async (dispatch: Dispatch) => {

    const step1 = async () => {
        await fundNode(web3, address, darknodeID, ethAmountStr, onCancel, onDone)(dispatch);
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
    ethNetwork: EthNetwork,
    address: string,
    darknodeID: string,
    title: string,
    onCancel: () => void,
    onDone: () => void,
) => async (dispatch: Dispatch) => {

    const step1 = async () => {
        await claimForNode(web3, ethNetwork, address, darknodeID, onCancel, onDone)(dispatch);
    };

    const steps = [
        { call: step1, name: "Claim rewards" },
    ];

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
