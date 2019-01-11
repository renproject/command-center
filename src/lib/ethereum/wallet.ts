import Web3 from "web3";
import ProviderEngine from "web3-provider-engine";
import FetchSubprovider from "web3-provider-engine/subproviders/fetch";

import { Provider } from "web3/providers";

import { clearPopup } from "../../actions/popup/popupActions";
import { INFURA_URL } from "../../environmentVariables";
import { ETH_NETWORK } from "../../environmentVariables";
import { store } from "../../index";
import { Language } from "../../languages/language";

export const ErrorCanceledByUser = "Returned error: Error: MetaMask Tx Signature: User denied transaction signature.";

export const getReadOnlyProvider = (): Provider => {
    const engine = new ProviderEngine();
    engine.addProvider(new FetchSubprovider({ rpcUrl: INFURA_URL }));
    engine.start();
    return engine;
};

export function PopupPromise<T>(
    fn: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: Error) => void) => void,
): Promise<T> {
    return new Promise((
        resolve: (value?: T | PromiseLike<T> | undefined) => void,
        reject: (reason?: unknown) => void,
    ) => {

        const innerReject: (reason?: Error) => void = (reason: Error | undefined) => {
            store.dispatch(clearPopup());
            reject(reason);
        };
        const innerResolve: (value?: T | PromiseLike<T>) => void = (reason: T | PromiseLike<T> | undefined) => {
            store.dispatch(clearPopup());
            resolve(reason);
        };
        fn(innerResolve, innerReject);
    });
}

const ErrorNoWeb3 = Language.wallet.mustInstallMetaMask;
const ErrorNoAccounts = Language.wallet.noAccounts;
const ErrorAccountAccessRejected = Language.wallet.mustConnect;
const ErrorWrongNetwork = Language.wallet.mustChangeNetwork;

export const getInjectedWeb3Provider = async (): Promise<Provider> => {
    let provider;

    if (window.ethereum) {
        try {
            await window.ethereum.enable();
            provider = window.ethereum;
        } catch (error) {
            throw new Error(ErrorAccountAccessRejected);
        }
    } else if (window.web3) {
        provider = window.web3.currentProvider;
    } else {
        throw new Error(ErrorNoWeb3);
    }

    const web3 = new Web3(provider);

    // Check that the provider is using the correct network
    // tslint:disable-next-line:no-any
    if ((await (web3.eth.net as any).getNetworkType()) !== ETH_NETWORK) {
        throw new Error(ErrorWrongNetwork);
    }

    if ((await web3.eth.getAccounts()).length === 0) {
        throw new Error(ErrorNoAccounts);
    }

    return provider;
};
