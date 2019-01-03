import Web3 from "web3";

import { Provider } from "web3/providers";

import { Language } from "../../languages/language";
import { networkData } from "../../lib/network";
import { WalletDetail } from "../../lib/wallets/wallet";
import { getAccounts, getNetwork } from "../../lib/web3";

export const ErrorNoWeb3 = Language.wallet.mustInstallMetaMask;
export const ErrorNoAccounts = Language.wallet.noAccounts;
export const ErrorAccountAccessRejected = Language.wallet.mustConnect;
export const ErrorWrongNetwork = Language.wallet.mustChangeNetwork;

export const MetaMask: WalletDetail = {
    name: Language.wallet.metamask,
    slug: "metamask",
    description: Language.wallet.metamaskDescription,
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
