/////////// WEB3 ///////////////////////////////////////////////////////////////

// tslint:disable

import BN from "bn.js";
import { Log, PromiEvent, TransactionReceipt } from "web3-core";
import { Contract } from "web3-eth-contract";

export interface Transaction { receipt: TransactionReceipt; tx: string; logs: Log[]; }

export interface SendOptions {
    from?: string;
    gasPrice?: string;
    gas?: number;
    value?: number | string | BN;
}

type BigNumber = string | number | BN;


export interface Read<T> {
    call: (options?: SendOptions) => Promise<T | null>;
}
export interface Write {
    send: (options?: SendOptions) => PromiEvent<Transaction>;
}
export interface DarknodePaymentWeb3 extends Contract {
    methods: {
        previousCycleRewardShare(index_0: string): Read<BigNumber>;
        cycleStartTime(): Read<BigNumber>;
        pendingTokens(index_0: BigNumber): Read<string>;
        cycleDuration(): Read<BigNumber>;
        renounceOwnership(): Write;
        shareCount(): Read<BigNumber>;
        rewardClaimed(index_0: string, index_1: BigNumber): Read<boolean>;
        owner(): Read<string>;
        isOwner(): Read<boolean>;
        unclaimedRewards(index_0: string): Read<BigNumber>;
        store(): Read<string>;
        registeredTokens(index_0: BigNumber): Read<string>;
        darknodeRegistry(): Read<string>;
        currentCycle(): Read<BigNumber>;
        blacklister(): Read<string>;
        registeredTokenIndex(index_0: string): Read<BigNumber>;
        cycleTimeout(): Read<BigNumber>;
        previousCycle(): Read<BigNumber>;
        transferOwnership(newOwner: string): Write;
        ETHEREUM(): Read<string>;
        VERSION(): Read<string>;
        withdraw(_darknode: string, _token: string): Write;
        withdrawMultiple(_darknode: string, _tokens: string[]): Write;
        currentCycleRewardPool(_token: string): Read<BigNumber>;
        darknodeBalances(_darknodeID: string, _token: string): Read<BigNumber>;
        changeCycle(): Write;
        deposit(_value: BigNumber, _token: string): Write;
        claim(_darknode: string): Write;
        blacklist(_darknode: string): Write;
        registerToken(_token: string): Write;
        deregisterToken(_token: string): Write;
        updateBlacklister(_addr: string): Write;
        updateCycleDuration(_durationSeconds: BigNumber): Write;
        transferStoreOwnership(_newOwner: string): Write;
        claimStoreOwnership(): Write;
    }
}
