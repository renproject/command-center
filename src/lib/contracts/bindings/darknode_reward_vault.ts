// tslint:disable

import { Tx } from "web3/eth/types";
import { Provider } from "web3/providers";
import PromiEvent from "web3/promiEvent";
import { TransactionReceipt, EventLog } from "web3/types";

type BigNumber = string;

interface Transaction { receipt: TransactionReceipt; tx: string; logs: EventLog[]; }

export const DarknodeRewardVaultEvents = {
    LogDarknodeRegistryUpdated: (previousDarknodeRegistry: string, nextDarknodeRegistry: string) => ({
        event: 'LogDarknodeRegistryUpdated',
        args: {
            previousDarknodeRegistry,
            nextDarknodeRegistry,
        },
    }),
    OwnershipRenounced: (previousOwner: string) => ({
        event: 'OwnershipRenounced',
        args: {
            previousOwner,
        },
    }),
    OwnershipTransferred: (previousOwner: string, newOwner: string) => ({
        event: 'OwnershipTransferred',
        args: {
            previousOwner,
            newOwner,
        },
    }),
};

export interface DarknodeRewardVaultContract {
    renounceOwnership(options?: Tx): PromiEvent<Transaction>;
    transferOwnership(_newOwner: string, options?: Tx): PromiEvent<Transaction>;
    updateDarknodeRegistry(_newDarknodeRegistry: string, options?: Tx): PromiEvent<Transaction>;
    deposit(_darknode: string, _token: string, _value: BigNumber, options?: Tx): PromiEvent<Transaction>;
    withdraw(_darknode: string, _token: string, options?: Tx): PromiEvent<Transaction>;

    darknodeBalances(index_0: string, index_1: string, options?: Tx): Promise<BigNumber>;
    owner(options?: Tx): Promise<string>;
    darknodeRegistry(options?: Tx): Promise<string>;
    ETHEREUM(options?: Tx): Promise<string>;
    VERSION(options?: Tx): Promise<string>;

    address: string;
}

export interface DarknodeRewardVaultArtifact {
    new(address: string): DarknodeRewardVaultContract;
    address: string;
    "new"(_VERSION: string, _darknodeRegistry: string, options?: Tx): Promise<DarknodeRewardVaultContract>;
    at(address: string): Promise<DarknodeRewardVaultContract>;
    deployed(): Promise<DarknodeRewardVaultContract>;
    setProvider(provider: Provider): void;
}
