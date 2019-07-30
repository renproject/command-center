import * as React from "react";

import { RenNetworkDetails } from "@renproject/contracts";
import Web3 from "web3";

import { WithdrawPopup } from "../../components/popups/WithdrawPopup";
import { withdrawOldToken, withdrawToken } from "../../lib/ethereum/operator";
import { AllTokenDetails, OldToken, Token } from "../../lib/ethereum/tokens";
import { ApplicationState } from "../applicationState";
import { WaitForTX } from "../network/operatorActions";
import { clearPopup, setPopup } from "../popup/popupActions";
import { AppDispatch } from "../rootReducer";

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

    const withdraw = withdrawToken(
        web3,
        renNetwork,
        address,
        darknodeID,
        token,
        waitForTX,
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
            />,
            onCancel,
        );
    } else {
        try {
            await withdraw();
        } catch (error) {
            onCancel();
        }
    }
});

export const withdrawReward = (
    darknodeID: string,
    token: Token | OldToken,
    waitForTX: WaitForTX,
) => async (dispatch: AppDispatch, getState: () => ApplicationState) => {
    const { web3, address, renNetwork } = getState().account;

    const tokenDetails = AllTokenDetails.get(token);
    if (tokenDetails === undefined) {
        throw new Error("Unknown token");
    }

    if (tokenDetails.old && renNetwork.name === "mainnet") {
        await withdrawOldToken(web3, renNetwork, address, darknodeID, token, waitForTX);
    } else {
        const callClearPopup = () => { dispatch(clearPopup()); };
        const callSetPopup = (
            popup: JSX.Element,
            onCancel: () => void,
        ) => dispatch(setPopup({ popup, overlay: true, onCancel }));
        await showWithdrawToken(web3, renNetwork, address, darknodeID, token, waitForTX, callClearPopup, callSetPopup);
    }
};
