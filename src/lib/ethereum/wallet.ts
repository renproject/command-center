import Web3 from "web3";
import { provider } from "web3-providers";

import { Language } from "../../languages/language";
import { PUBLIC_NODE } from "../environmentVariables";
import { _noCapture_ } from "../errors";

export const ErrorCanceledByUser = "User denied transaction signature.";

const ErrorNoWeb3 = Language.wallet.mustInstallMetaMask;
const ErrorNoAccounts = Language.wallet.noAccounts;
const ErrorAccountAccessRejected = Language.wallet.mustConnect;

const getReadOnlyWeb3 = (): Web3 => {
    return new Web3(PUBLIC_NODE);
};

export const readOnlyWeb3 = getReadOnlyWeb3();

export const getInjectedWeb3Provider = async (onAnyProvider: (provider: provider) => void): Promise<provider> => {
    let injectedProvider;

    if (window.ethereum) {
        try {
            await window.ethereum.enable();
            injectedProvider = window.ethereum;
        } catch (error) {
            throw _noCapture_(new Error(ErrorAccountAccessRejected));
        }
    } else if (window.web3) {
        injectedProvider = window.web3.currentProvider;
    } else {
        throw _noCapture_(new Error(ErrorNoWeb3));
    }

    onAnyProvider(injectedProvider);

    const web3 = new Web3(injectedProvider);

    if ((await web3.eth.getAccounts()).length === 0) {
        throw new Error(ErrorNoAccounts);
    }

    return injectedProvider;
};
