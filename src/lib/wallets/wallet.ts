import ProviderEngine from "web3-provider-engine";
import FetchSubprovider from "web3-provider-engine/subproviders/fetch";

import { Provider } from "web3/providers";

import { clearPopup } from "../../actions/popup/popupActions";
import { store } from "../../index";
import { INFURA_URL } from "../../lib/network";

export const ErrorCanceledByUser = "Returned error: Error: MetaMask Tx Signature: User denied transaction signature.";

export interface WalletDetail {
    name: string;
    slug: string; // Slug is used as class name for specifying icons in _wallets.scss
    description: string;
    enabled: boolean;
    getWeb3Provider(address?: string): Promise<[Provider, string[] | null]> | [Provider, string[] | null];
}

export const getReadOnlyProvider = (): Provider => {
    const engine = new ProviderEngine();
    engine.addProvider(new FetchSubprovider({ rpcUrl: INFURA_URL }));
    engine.start();
    return engine;
};

export function PopupPromise<T>(
    fn: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: Error) => void) => void,
): Promise<T> {
    return new Promise((resolve, reject) => {

        const innerReject: (reason?: Error) => void = (reason) => {
            store.dispatch(clearPopup());
            reject(reason);
        };
        const innerResolve: (value?: T | PromiseLike<T>) => void = (reason) => {
            store.dispatch(clearPopup());
            resolve(reason);
        };
        fn(innerResolve, innerReject);
    });
}
