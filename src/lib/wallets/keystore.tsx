import * as React from "react";

import * as ethereumjsWallet from "ethereumjs-wallet";
import WalletSubprovider from "ethereumjs-wallet/provider-engine";

import ProviderEngine from "web3-provider-engine";
import FetchSubprovider from "web3-provider-engine/subproviders/fetch";
import NonceSubprovider from "web3-provider-engine/subproviders/nonce-tracker";

import KeystorePopup from "@Components/popups/KeystorePopup";

import { setPopup } from "@Actions/popup/popupActions";
import { INFURA_URL } from "@Library/network";
import { ErrorCanceledByUser, PopupPromise, WalletDetail } from "@Library/wallets/wallet";
import { store } from "index";
import { Provider } from "web3/types";

const KeystoreUnlockError = "Unable to retrieve account from keystore";
const UnsupportedKeystoreError = "Unsupported keystore format";
const KeystorePasswordError = "Unable to unlock keystore - the password may be wrong";

export const Keystore: WalletDetail = {
    name: "Keystore File",
    slug: "keystore",
    description: "Sign in using a Keystore JSON file",
    enabled: true,
    // create a web3 with the ledger device
    getWeb3Provider: async (address?: string) => PopupPromise<[Provider, string[] | null]>(async (resolve, reject) => {

        // tslint:disable-next-line:no-any
        const { keystore, password } = await new Promise(async (innerResolve: (value: { keystore: any; password: string }) => void) => {
            store.dispatch(setPopup(
                {
                    popup: <KeystorePopup resolve={innerResolve} reject={reject} address={address} />,
                    onCancel: () => { reject(new Error(ErrorCanceledByUser)); }
                }
            ));
        });

        if (keystore.Crypto && !keystore.crypto) {
            keystore.crypto = keystore.Crypto;
        }

        const version = parseInt(keystore.version, 10);

        // tslint:disable-next-line:no-any
        let wallet: any;
        try {
            if (version === 1) {
                wallet = ethereumjsWallet.fromV1(keystore, password);
            } else if (version === 3) {
                wallet = ethereumjsWallet.fromV3(keystore, password);
            } else if (keystore.privateKey) {
                let privateKey = keystore.privateKey;
                if (privateKey.slice(0, 2) === "0x") {
                    privateKey = privateKey.slice(2);
                }
                wallet = ethereumjsWallet.fromPrivateKey(new Buffer(privateKey, "hex"));
            } else {
                throw new Error(UnsupportedKeystoreError);
            }

            if (!wallet) {
                throw new Error(KeystoreUnlockError);
            }
        } catch (err) {
            console.error(err);
            if (err.message === "Not a V3 wallet" ||
                err.message === "Not a V1 wallet") {
                reject(new Error(UnsupportedKeystoreError));
            } else if (err.message === UnsupportedKeystoreError) {
                reject(err);
            } else if (err.message === KeystoreUnlockError) {
                reject(err);
            } else {
                reject(new Error(KeystorePasswordError));
            }
            return;
        }

        wallet.getAddressesString = (() => `0x${wallet.getAddress().toString("hex")}`);

        const walletProvider = new WalletSubprovider(wallet, {});

        const engine = new ProviderEngine();
        engine.addProvider(walletProvider);
        engine.addProvider(new NonceSubprovider());
        engine.addProvider(new FetchSubprovider({ rpcUrl: INFURA_URL }));
        engine.start();
        resolve([engine, null]);
    }),
};
