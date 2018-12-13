import Web3 from "web3";

import { Provider } from "web3/providers";

import { networkData } from "@Library/network";
import { WalletDetail } from "@Library/wallets/wallet";
import { getAccounts, getNetwork } from "@Library/web3";

export const ErrorNoWeb3 = "Please ensure you are using MetaMask or a Web3 browser.";
export const ErrorNoAccounts = "No accounts found. Please ensure your wallet is unlocked.";
export const ErrorAccountAccessRejected = "Please allow RenEx to access your Ethereum wallet.";
export const ErrorWrongNetwork = `Please ensure you are on the ${networkData.ethNetworkLabel} network.`;

export const MetaMask: WalletDetail = {
    name: "MetaMask",
    slug: "metamask",
    description: "Sign in using the MetaMask extension or a Web3 browser",
    enabled: true,
    getWeb3Provider: async (): Promise<[Provider, string[] | null]> => {
        const provider = await getInjectedWeb3Provider();
        return [provider, null];
    },
};

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
    if ((await getNetwork(web3)) !== networkData.ethNetwork) {
        throw new Error(ErrorWrongNetwork);
    }

    if ((await getAccounts(web3)).length === 0) {
        throw new Error(ErrorNoAccounts);
    }

    return provider;
};
