import { ENGLISH } from "./english";

export interface Language {
    wallet: {
        metamask: string;

        noAccounts: string;
        mustInstallWeb3Browser: string;
        mustUnlock: string;
        mustConnect: string;
    };
}

export const Language = ENGLISH;
