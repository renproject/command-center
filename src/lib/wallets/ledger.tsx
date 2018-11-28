import * as React from "react";

import Web3 from "web3";

import TransportU2F from "@ledgerhq/hw-transport-u2f";
import createLedgerSubprovider from "@ledgerhq/web3-subprovider";
import ProviderEngine from "web3-provider-engine";
import FetchSubprovider from "web3-provider-engine/subproviders/fetch";
import NonceSubprovider from "web3-provider-engine/subproviders/nonce-tracker";

import { HttpProvider, Provider } from "web3/types";

import LedgerPopup from "@Components/popups/LedgerPopup";

import { setPopup } from "@Actions/popup/popupActions";
import { INFURA_URL, networkData } from "@Library/network";
import { ErrorCanceledByUser, PopupPromise, WalletDetail } from "@Library/wallets/wallet";
import { getAccounts } from "@Library/web3";
import { store } from "../../index";

export const ErrorNoLedger = "Ledger not detected";

interface ProviderEngine extends HttpProvider {
    start(): void;
    stop(): void;
}

const createProvider = (derivation: string): ProviderEngine => {
    const engine = new ProviderEngine();
    const getTransport = () => TransportU2F.create();

    // Remove m/ from start
    if (derivation.slice(0, 2) === "m/") {
        derivation = derivation.slice(2);
    }

    const ledger = createLedgerSubprovider(getTransport, {
        networkId: networkData.ledgerNetworkId,
        accountsLength: 5,
        path: derivation,
    });
    engine.addProvider(ledger);
    engine.addProvider(new NonceSubprovider());
    engine.addProvider(new FetchSubprovider({ rpcUrl: INFURA_URL }));
    engine.start();
    return engine;
};

const checkConnection = async (args: { derivation: string }): Promise<[ProviderEngine, string[]]> => {
    const engine = createProvider(args.derivation);
    const accounts = await getAccounts(await new Web3(engine));
    if (!accounts || accounts.length === 0) {
        throw new Error("Unable to read accounts.");
    }
    return [engine, accounts];
};

export const Ledger: WalletDetail = {
    name: "Ledger",
    slug: "ledger",
    description: "Sign in using your Ledger hardware wallet",
    enabled: true,
    // create a web3 with the ledger device
    getWeb3Provider: async (address?: string) => PopupPromise<[Provider, string[] | null]>(async (resolve, reject) => {

        store.dispatch(setPopup(
            {
                popup: <LedgerPopup resolve={resolve} reject={reject} address={address} checkConnection={checkConnection} />,
                onCancel: () => { reject(new Error(ErrorCanceledByUser)); }
            }
        ));
    }),
};
