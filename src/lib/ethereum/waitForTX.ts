import { PromiEvent } from "web3-core";

import { addTransaction, setTxConfirmations } from "../../store/network/networkActions";
import { AppDispatch } from "../../store/rootReducer";

export type WaitForTX = <T>(promiEvent: PromiEvent<T>, onConfirmation?: (confirmations?: number) => void) => Promise<string>;
export const waitForTX = <T>(promiEvent: PromiEvent<T>, onConfirmation?: (confirmations?: number) => void) => async (dispatch: AppDispatch) => new Promise<string>((resolve, reject) => {
    promiEvent.on("transactionHash", (txHash) => {
        resolve(txHash);
        dispatch(addTransaction({ txHash, tx: promiEvent }));
        promiEvent.on("confirmation", (confirmations) => {
            dispatch(setTxConfirmations({ txHash, confirmations }));
            if (onConfirmation) { onConfirmation(confirmations); }
        });
        promiEvent.on("error", () => {
            dispatch(setTxConfirmations({ txHash, confirmations: -1 }));
        });
    }).catch(reject);
});
export const connectWaitForTX = (dispatch: AppDispatch) => <T>(promiEvent: PromiEvent<T>, onConfirmation?: (confirmations?: number) => void) => dispatch(waitForTX(promiEvent, onConfirmation));
export const simpleWaitForTX: WaitForTX = async <T>(promiEvent: PromiEvent<T>, onConfirmation?: (confirmations?: number) => void) => new Promise<string>((resolve, reject) => {
    promiEvent.on("transactionHash", (txHash) => {
        resolve(txHash);
        promiEvent.on("confirmation", (confirmations) => {
            if (onConfirmation) { onConfirmation(confirmations); }
        });
    }).catch(reject);
});
