import * as React from "react";

import RenExSDK from "@renex/renex";
import BigNumber from "bignumber.js";

import { Map } from "immutable";
import { Dispatch } from "redux";

import { setPopup } from "@Actions/popup/popupActions";
import { approveNode, deregisterNode, fundNode, refundNode, registerNode } from "@Actions/trader/darknode";
import { MultiStepPopup } from "@Components/popups/MultiStepPopup";
import { DarknodeDetails, TokenPrices } from "@Reducers/types";
import { updateDarknodeStatistics } from "./operatorActions";

export const showRegisterPopup = (sdk: RenExSDK, address: string, darknodeID: string, publicKey: string, minimumBond: BigNumber, tokenPrices: TokenPrices, onCancel: () => void, onDone: () => void) => async (dispatch: Dispatch) => {

    const step1 = async () => {
        await approveNode(sdk, address, minimumBond)(dispatch);
    };

    const step2 = async () => {
        await registerNode(sdk, address, darknodeID, publicKey, minimumBond || new BigNumber(100000), onCancel, onDone)(dispatch);

        if (tokenPrices) {
            try {
                await updateDarknodeStatistics(sdk, darknodeID, tokenPrices)(dispatch);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const steps = [
        { call: () => step1(), name: "Approve 100'000 REN" },
        { call: () => step2(), name: "Register darknode" },
    ];

    const title = "Register darknode";

    dispatch(setPopup(
        { popup: <MultiStepPopup steps={steps} onCancel={onCancel} title={title} confirm={true} />, onCancel, dismissible: false, overlay: true }
    ));
};

export const showDeregisterPopup = (sdk: RenExSDK, address: string, darknodeID: string, onCancel: () => void, onDone: () => void) => async (dispatch: Dispatch) => {

    const step1 = async () => {
        await deregisterNode(sdk, address, darknodeID, onCancel, onDone)(dispatch);
    };

    const steps = [
        { call: () => step1(), name: "Deregister darknode" },
    ];

    const title = "Deregister darknode";

    dispatch(setPopup(
        { popup: <MultiStepPopup steps={steps} onCancel={onCancel} title={title} confirm={true} />, onCancel, dismissible: false, overlay: true }
    ));
};



export const showRefundPopup = (sdk: RenExSDK, address: string, darknodeID: string, onCancel: () => void, onDone: () => void) => async (dispatch: Dispatch) => {

    const step1 = async () => {
        await refundNode(sdk, address, darknodeID, onCancel, onDone)(dispatch);
    };

    const steps = [
        { call: () => step1(), name: "Refund REN" },
    ];

    const title = "Refund REN";

    dispatch(setPopup(
        { popup: <MultiStepPopup steps={steps} onCancel={onCancel} title={title} confirm={false} />, onCancel, dismissible: false, overlay: true }
    ));
};

export const showFundPopup = (sdk: RenExSDK, address: string, darknodeID: string, ethAmountStr: string, onCancel: () => void, onDone: () => void) => async (dispatch: Dispatch) => {

    const step1 = async () => {
        await fundNode(sdk, address, darknodeID, ethAmountStr, onCancel, onDone)(dispatch);
    };

    const steps = [
        { call: () => step1(), name: "Fund darknode" },
    ];

    const title = "Fund darknode";

    dispatch(setPopup(
        { popup: <MultiStepPopup steps={steps} onCancel={onCancel} title={title} confirm={false} />, onCancel, dismissible: false, overlay: true }
    ));
};
