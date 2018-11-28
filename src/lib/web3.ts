import Web3 from "web3";

import { Transaction } from "renex-sdk-ts";
import { PromiEvent } from "web3/types";

export function getAccounts(web3: Web3): Promise<string[]> {
    return web3.eth.getAccounts();
}

export function getNetwork(web3: Web3): Promise<string> {
    // tslint:disable-next-line:no-any
    return (web3.eth.net as any).getNetworkType();
}

export function getBalance(web3: Web3, address: string): Promise<number> {
    return web3.eth.getBalance(address);
}

export function includesAddress(web3: Web3, address: string): Promise<boolean> {
    return getAccounts(web3).then((accounts: string[]) => {
        return accounts.map(acc => acc.toLowerCase()).includes(address.toLowerCase());
    });
}
