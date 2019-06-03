// tslint:disable

import BN from "bn.js";
import { Log, PromiEvent, TransactionReceipt } from "web3-core";
import { Contract, SendOptions } from "web3-eth-contract";

export interface Transaction { receipt: TransactionReceipt; tx: string; logs: Log[]; }

type BigNumber = string | number | BN;


export interface Read<T> {
    call: (options?: SendOptions) => Promise<T | null>;
}
export interface Write {
    send: (options?: SendOptions) => PromiEvent<Transaction>;
}
export interface DarknodeRegistryWeb3 extends Contract {
    methods: {
        numDarknodesNextEpoch(): Read<BigNumber>;
        numDarknodes(): Read<BigNumber>;
        nextSlasher(): Read<string>;
        nextMinimumEpochInterval(): Read<BigNumber>;
        minimumEpochInterval(): Read<BigNumber>;
        previousEpoch(): Read<{ epochhash: BigNumber, blocknumber: BigNumber, 0: BigNumber, 1: BigNumber }>;
        nextMinimumBond(): Read<BigNumber>;
        nextMinimumPodSize(): Read<BigNumber>;
        renounceOwnership(): Write;
        numDarknodesPreviousEpoch(): Read<BigNumber>;
        currentEpoch(): Read<{ epochhash: BigNumber, blocknumber: BigNumber, 0: BigNumber, 1: BigNumber }>;
        ren(): Read<string>;
        owner(): Read<string>;
        isOwner(): Read<boolean>;
        store(): Read<string>;
        minimumBond(): Read<BigNumber>;
        slasher(): Read<string>;
        minimumPodSize(): Read<BigNumber>;
        transferOwnership(newOwner: string): Write;
        VERSION(): Read<string>;
        register(_darknodeID: string, _publicKey: string, _bond: BigNumber): Write;
        deregister(_darknodeID: string): Write;
        epoch(): Write;
        transferStoreOwnership(_newOwner: string): Write;
        claimStoreOwnership(): Write;
        updateMinimumBond(_nextMinimumBond: BigNumber): Write;
        updateMinimumPodSize(_nextMinimumPodSize: BigNumber): Write;
        updateMinimumEpochInterval(_nextMinimumEpochInterval: BigNumber): Write;
        updateSlasher(_slasher: string): Write;
        slash(_prover: string, _challenger1: string, _challenger2: string): Write;
        refund(_darknodeID: string): Write;
        getDarknodeOwner(_darknodeID: string): Read<string>;
        getDarknodeBond(_darknodeID: string): Read<BigNumber>;
        getDarknodePublicKey(_darknodeID: string): Read<string>;
        getDarknodes(_start: string, _count: BigNumber): Read<string[]>;
        getPreviousDarknodes(_start: string, _count: BigNumber): Read<string[]>;
        isPendingRegistration(_darknodeID: string): Read<boolean>;
        isPendingDeregistration(_darknodeID: string): Read<boolean>;
        isDeregistered(_darknodeID: string): Read<boolean>;
        isDeregisterable(_darknodeID: string): Read<boolean>;
        isRefunded(_darknodeID: string): Read<boolean>;
        isRefundable(_darknodeID: string): Read<boolean>;
        isRegistered(_darknodeID: string): Read<boolean>;
        isRegisteredInPreviousEpoch(_darknodeID: string): Read<boolean>;
    }
}
