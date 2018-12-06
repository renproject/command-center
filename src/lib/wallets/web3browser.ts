import { Provider } from "web3/providers";

import { WalletDetail } from "@Library/wallets/wallet";

export const ErrorNoMetaMask = "Please ensure you have MetaMask installed";
export const ErrorMetaMaskLocked = "Please unlock your MetaMask wallet";
export const ErrorMetaMaskAccessRejected = "Please allow RenEx to access your MetaMask wallet";

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
    if (window.ethereum) {
        try {
            await window.ethereum.enable();
            return window.ethereum;
        } catch (error) {
            throw new Error(ErrorMetaMaskAccessRejected);
        }
    }
    else if (window.web3) {
        return window.web3.currentProvider;
    }
    throw new Error(ErrorNoMetaMask);
};
