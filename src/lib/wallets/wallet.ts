import Web3 from "web3";
import ProviderEngine from "web3-provider-engine";
import FetchSubprovider from "web3-provider-engine/subproviders/fetch";

import { List, Map } from "immutable";
import { Provider } from "web3/providers";

import { clearPopup } from "@Actions/popup/popupActions";
import { INFURA_URL } from "@Library/network";
import { MetaMask } from "@Library/wallets/web3browser";
import { store } from "index";

export const ErrorCanceledByUser = "Transaction canceled";

export enum Wallet {
    MetaMask,
}

// This defines the order in which the wallets are rendered
export const WalletList = List([Wallet.MetaMask]);

export interface WalletDetail {
    name: string;
    slug: string; // Slug is used as class name for specifying icons in _wallets.scss
    description: string;
    enabled: boolean;
    getWeb3Provider(address?: string): Promise<[Provider, string[] | null]> | [Provider, string[] | null];
}


export const getReadOnlyWeb3 = (): Web3 => new Web3(getReadOnlyProvider());

export const getReadOnlyProvider = (): Provider => {
    const engine = new ProviderEngine();
    engine.addProvider(new FetchSubprovider({ rpcUrl: INFURA_URL }));
    engine.start();
    return engine;
};

export function PopupPromise<T>(fn: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: Error) => void) => void): Promise<T> {
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

export const WalletDetails: Map<Wallet, WalletDetail> = Map<Wallet, WalletDetail>()
    .set(Wallet.MetaMask, MetaMask)
    ;
