import { Provider } from "web3/providers";

import cipherIcon from "../../styles/images/browsers/cipher.png";
import metamaskIcon from "../../styles/images/browsers/metamask.svg";
import mistIcon from "../../styles/images/browsers/mist.png";
import statusIcon from "../../styles/images/browsers/status.svg";
import toshiIcon from "../../styles/images/browsers/toshi.png";
import trustIcon from "../../styles/images/browsers/trust.svg";

/**
 * This file is for changing text and icons based on which Web3 wallet the user
 * is using. The changes are visual only - not functional.
 */

export enum Web3Browser {
    CoinbaseWallet = "Coinbase Wallet",
    Cipher = "Cipher",
    Status = "Status",
    Trust = "Trust",
    MetaMask = "MetaMask",
    Mist = "Mist",
    Web3Browser = "Web3 Browser",
}

export const getWeb3BrowserName = (provider: Provider): Web3Browser => {
    // tslint:disable:no-any
    if ((provider as any).isToshi) {
        // Toshi has become Coinbase wallet
        return Web3Browser.CoinbaseWallet;
    } else if ((provider as any).isCipher) {
        return Web3Browser.Cipher;
    } else if ((provider as any).isStatus) {
        return Web3Browser.Status;
    } else if ((provider as any).isTrust) {
        return Web3Browser.Trust;
    } else if ((provider as any).isMetaMask) {
        return Web3Browser.MetaMask;
    } else if ((window as any).mist) {
        return Web3Browser.Mist; // Not tested
    }

    return Web3Browser.Web3Browser;
};

export const getWeb3BrowserIcon = (web3Browser: Web3Browser): string => {
    // Note: Typescript will warn if the switch statement is non-exhaustive

    // tslint:disable-next-line: switch-default
    switch (web3Browser) {
        case Web3Browser.CoinbaseWallet:
            return toshiIcon;
        case Web3Browser.Cipher:
            return cipherIcon;
        case Web3Browser.Status:
            return statusIcon;
        case Web3Browser.Trust:
            return trustIcon;
        case Web3Browser.MetaMask:
            return metamaskIcon;
        case Web3Browser.Mist:
            return mistIcon;
        case Web3Browser.Web3Browser:
            return metamaskIcon;
    }
};
