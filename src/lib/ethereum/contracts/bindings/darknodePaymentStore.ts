/////////// WEB3 ///////////////////////////////////////////////////////////////

// tslint:disable

import BN from "bn.js";
import { Log, PromiEvent, TransactionReceipt, TransactionConfig } from "web3-core";
import { Contract } from "web3-eth-contract";

export interface Transaction { receipt: TransactionReceipt; tx: string; logs: Log[]; }

type BigNumber = string | number | BN;


export interface Read<T> {
    call: (options?: TransactionConfig) => Promise<T | null>;
}
export interface Write {
    send: (options?: TransactionConfig) => PromiEvent<Transaction>;
}
export interface DarknodePaymentStoreWeb3 extends Contract {
    methods: {
        lockedBalances(index_0: string): Read<BigNumber>;
        darknodeWhitelistLength(): Read<BigNumber>;
        darknodeBlacklist(index_0: string): Read<BigNumber>;
        claimOwnership(): Write;
        darknodeBalances(index_0: string, index_1: string): Read<BigNumber>;
        renounceOwnership(): Write;
        owner(): Read<string>;
        isOwner(): Read<boolean>;
        darknodeWhitelist(index_0: string): Read<BigNumber>;
        transferOwnership(newOwner: string): Write;
        ETHEREUM(): Read<string>;
        VERSION(): Read<string>;
        isBlacklisted(_darknode: string): Read<boolean>;
        isWhitelisted(_darknode: string): Read<boolean>;
        totalBalance(_token: string): Read<BigNumber>;
        availableBalance(_token: string): Read<BigNumber>;
        blacklist(_darknode: string): Write;
        whitelist(_darknode: string): Write;
        incrementDarknodeBalance(_darknode: string, _token: string, _amount: BigNumber): Write;
        transfer(_darknode: string, _token: string, _amount: BigNumber, _recipient: string): Write;
    }
}