import { provider } from "web3-providers";

import cipherIcon from "../../styles/images/browsers/cipher.png";
import metamaskIcon from "../../styles/images/browsers/metamask.svg";
import mistIcon from "../../styles/images/browsers/mist.png";
import statusIcon from "../../styles/images/browsers/status.svg";
import toshiIcon from "../../styles/images/browsers/toshi.png";
import trustIcon from "../../styles/images/browsers/trust.svg";
import walletIcon from "../../styles/images/wallet.svg";

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

export const getWeb3BrowserName = (newProvider: provider): Web3Browser => {
    /*
    // Check for mobile
    const { userAgent: ua } = navigator
    const isIOS = ua.includes('iPhone') // “iPhone OS”
    const isAndroid = ua.includes('Android')
    */

    // tslint:disable:no-any
    if ((newProvider as any).isToshi) {
        // Toshi has become Coinbase wallet
        return Web3Browser.CoinbaseWallet;
    } else if ((newProvider as any).isCipher) {
        return Web3Browser.Cipher;
    } else if ((newProvider as any).isStatus) {
        return Web3Browser.Status;
    } else if ((newProvider as any).isTrust) {
        return Web3Browser.Trust;
    } else if ((newProvider as any).isMetaMask) {
        return Web3Browser.MetaMask;
    } else if ((window as any).mist) {
        return Web3Browser.Mist; // Not tested
    }

    return Web3Browser.Web3Browser;
};

export const getWeb3BrowserIcon = (web3Browser: Web3Browser): string => {
    // Note: Typescript will warn if the switch statement is non-exhaustive

    // tslint:disable: switch-default
    // eslint-disable-next-line
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
            return walletIcon;
    }
};
