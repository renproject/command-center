import Web3 from "web3";
import { HttpProvider, provider } from "web3-providers";

import { Language } from "../../languages/language";
import { noCapture } from "../react/errors";

export const ErrorCanceledByUser = "User denied transaction signature.";

const ErrorNoWeb3 = Language.wallet.mustInstallMetaMask;
// const ErrorNoAccounts = Language.wallet.noAccounts;
const ErrorAccountAccessRejected = Language.wallet.mustConnect;

export const getReadOnlyWeb3 = (publicNode: string): Web3 => {
    return new Web3(publicNode);
};

interface EthereumProvider extends HttpProvider {
    enable(): Promise<void>;
}

declare global {
    interface Window {
        web3: Web3 | undefined;
        ethereum: EthereumProvider | undefined;
    }
}

export const getInjectedWeb3Provider = async (onAnyProvider?: (provider: provider) => void): Promise<provider> => {
    let injectedProvider;

    if (window.ethereum) {
        try {
            await window.ethereum.enable();
            injectedProvider = window.ethereum;
        } catch (error) {
            throw noCapture(new Error(ErrorAccountAccessRejected));
        }
    } else if (window.web3) {
        injectedProvider = window.web3.currentProvider;
    } else {
        throw noCapture(new Error(ErrorNoWeb3));
    }

    if (onAnyProvider) { onAnyProvider(injectedProvider); }

    // const web3 = new Web3(injectedProvider);

    // if ((await web3.eth.getAccounts()).length === 0) {
    //     throw new Error(ErrorNoAccounts);
    // }

    return injectedProvider;
};
