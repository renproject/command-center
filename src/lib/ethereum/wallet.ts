import Web3 from "web3";
import ProviderEngine from "web3-provider-engine";
import FetchSubprovider from "web3-provider-engine/subproviders/fetch";

import { HttpProvider, Provider } from "web3/providers";

import { ETH_NETWORK, INFURA_URL } from "../../environmentVariables";
import { Language } from "../../languages/language";
import { _noCapture_ } from "../errors";

export const ErrorCanceledByUser = "User denied transaction signature.";

export interface ProviderEngine extends HttpProvider {
    /**
     * Starts the engine's block tracking
     */
    start(): void;

    /**
     * Stops the engine's block tracking
     */
    stop(): void;

    /**
     * Adds a provider to the engine
     */
    addProvider(provider: Provider): void;
}

export const getReadOnlyProvider = (): ProviderEngine => {
    const engine: ProviderEngine = new ProviderEngine();
    engine.addProvider(new FetchSubprovider({ rpcUrl: INFURA_URL }));
    engine.start();
    return engine;
};

const ErrorNoWeb3 = Language.wallet.mustInstallMetaMask;
const ErrorNoAccounts = Language.wallet.noAccounts;
const ErrorAccountAccessRejected = Language.wallet.mustConnect;
const ErrorWrongNetwork = Language.wallet.mustChangeNetwork;

export const getInjectedWeb3Provider = async (onAnyProvider: (provider: Provider) => void): Promise<Provider> => {
    let provider;

    if (window.ethereum) {
        try {
            await window.ethereum.enable();
            provider = window.ethereum;
        } catch (error) {
            throw _noCapture_(new Error(ErrorAccountAccessRejected));
        }
    } else if (window.web3) {
        provider = window.web3.currentProvider;
    } else {
        throw _noCapture_(new Error(ErrorNoWeb3));
    }

    onAnyProvider(provider);

    const web3 = new Web3(provider);

    // Check that the provider is using the correct network
    // tslint:disable-next-line:no-any
    if ((await (web3.eth.net as any).getNetworkType()) !== ETH_NETWORK) {
        throw _noCapture_(new Error(ErrorWrongNetwork));
    }

    if ((await web3.eth.getAccounts()).length === 0) {
        throw new Error(ErrorNoAccounts);
    }

    return provider;
};
