import { ETH_NETWORK_LABEL } from "../environmentVariables";
import { Language } from "./language";

export const ENGLISH: Language = {
    wallet: {
        metamask: `MetaMask`,

        noAccounts: `No accounts found. Ensure your wallet is unlocked.`,
        mustInstallMetaMask: `You must install MetaMask to access your darknodes.`,
        mustChangeNetwork: `You must change your wallet to the ${ETH_NETWORK_LABEL} network.`,
        mustUnlock: `You must unlock MetaMask to access your darknodes.`,
        mustConnect: `You must connect MetaMask to access your darknodes.`,
    }
};
