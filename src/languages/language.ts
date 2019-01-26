import { ENGLISH } from "./english";

export interface Language {
    wallet: {
        metamask: string;

        noAccounts: string;
        mustInstallMetaMask: string;
        mustChangeNetwork: string;
        mustUnlock: string;
        mustConnect: string;
    };
}

export const Language = ENGLISH;
