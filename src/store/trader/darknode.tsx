import * as React from "react";

import { WithdrawPopup } from "../../components/popups/WithdrawPopup";
import { DarknodePaymentWeb3 } from "../../lib/ethereum/contracts/bindings/darknodePayment";
import { withdrawOldToken } from "../../lib/ethereum/operator";
import { AllTokenDetails, OldToken, Token } from "../../lib/ethereum/tokens";
import { _noCapture_ } from "../../lib/react/errors";
import { ApplicationState } from "../applicationState";
import { clearPopup, setPopup } from "../popup/popupActions";
import { AppDispatch } from "../rootReducer";
import { WaitForTX } from "../statistics/operatorActions";

export const withdrawToken = (
    darknodeID: string,
    token: Token | OldToken,
    waitForTX: WaitForTX,
) => async (dispatch: AppDispatch, getState: () => ApplicationState) => new Promise(async (resolve, reject) => {
    const { renNetwork, web3, address } = getState().trader;

    const tokenDetails = AllTokenDetails.get(token);
    if (tokenDetails === undefined) {
        throw new Error("Unknown token");
    }

    if (!address) {
        throw new Error(`Unable to retrieve account address.`);
    }

    const withdraw = async (_withdrawAddress?: string) => {

        const darknodePayment: DarknodePaymentWeb3 = new (web3.eth.Contract)(
            renNetwork.addresses.ren.DarknodePayment.abi,
            renNetwork.addresses.ren.DarknodePayment.address
        );

        if (!tokenDetails) {
            throw new Error("Unknown token");
        }

        await waitForTX(
            darknodePayment.methods.withdraw(darknodeID, renNetwork.addresses.tokens[token]).send({ from: address }),
            resolve,
        );

        // if (tokenDetails.wrapped) {
        //     if (!withdrawAddress) {
        //         throw new Error("Invalid withdraw address");
        //     }
        //     await burn(web3, renNetwork, trader, token as Token, withdrawAddress)(dispatch);
        // }
    };
    const onCancel = () => {
        dispatch(clearPopup());
        reject();
    };
    const onDone = () => {
        dispatch(clearPopup());
        resolve();
    };
    if (tokenDetails.wrapped) {
        dispatch(setPopup(
            {
                popup: <WithdrawPopup
                    token={token as Token}
                    withdraw={withdraw}
                    onDone={onDone}
                    onCancel={onCancel}
                />,
                onCancel,
                overlay: true,
            },
        ));
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
    const { web3, address, renNetwork } = getState().trader;

    const tokenDetails = AllTokenDetails.get(token);
    if (tokenDetails === undefined) {
        throw new Error("Unknown token");
    }

    if (tokenDetails.old && renNetwork.name === "mainnet") {
        await withdrawOldToken(web3, renNetwork, address, darknodeID, token, waitForTX);
    } else {
        await dispatch(withdrawToken(darknodeID, token, waitForTX));
    }
};
