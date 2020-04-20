// tslint:disable:no-object-literal-type-assertion

import { RenNetwork, RenNetworkDetails, RenNetworks } from "@renproject/contracts";
import { Currency, Record } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { List, Map, OrderedMap, OrderedSet } from "immutable";
import { PromiEvent } from "web3-core";

import { NodeStatistics } from "../lib/darknode/jsonrpc";
import { DarknodeFeeStatus, RegistrationStatus } from "../lib/ethereum/contractReads";
import { getReadOnlyWeb3 } from "../lib/ethereum/getWeb3";
import { OldToken, Token } from "../lib/ethereum/tokens";
import { DEFAULT_REN_NETWORK, INFURA_KEY } from "../lib/react/environmentVariables";
import { _catchBackgroundException_ } from "../lib/react/errors";
import { Serializable } from "../lib/react/serializable";

export interface ApplicationState {
    network: PersistentNetworkState;
}

export const readOnlyWeb3 = getReadOnlyWeb3(`${(RenNetworks[DEFAULT_REN_NETWORK || RenNetwork.Testnet] as RenNetworkDetails).infura}/v3/${INFURA_KEY}`);

export class PersistentNetworkState extends Record({
    darknodeCount: null as BigNumber | null,
    orderCount: null as BigNumber | null,

    registrySync: { progress: 0, target: 0 },

    darknodeDetails: Map<string, DarknodesState>(),

    // tslint:disable-next-line: no-any
    transactions: OrderedMap<string, PromiEvent<any>>(),
    confirmations: OrderedMap<string, number>(),

    currentCycle: "",
    previousCycle: "",
    pendingRewards: OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>(),
    pendingTotalInEth: OrderedMap<string /* cycle */, BigNumber>(),
    pendingRewardsInEth: OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>(),
    cycleTimeout: new BigNumber(0),
    currentShareCount: new BigNumber(1),

    currentDarknodeCount: null as number | null,
    previousDarknodeCount: null as number | null,
    nextDarknodeCount: null as number | null,

    ///////////////////////////////////////////////////////////
    // If these change, localstorage migration may be needed //
    ///////////////////////////////////////////////////////////
    quoteCurrency: Currency.USD,
    darknodeNames: Map<string, string>(),
    darknodeRegisteringList: Map<string, string>(),
    // Map from operator-address to list of darknodes.
    darknodeList: Map<string, OrderedSet<string>>(),
    withdrawAddresses: Map<Token, List<string>>(),
    ///////////////////////////////////////////////////////
}) implements Serializable<PersistentNetworkState> {
    public serialize(): string {
        const js = this.toJS();
        return JSON.stringify({
            quoteCurrency: js.quoteCurrency,
            darknodeList: js.darknodeList,
            darknodeNames: js.darknodeNames,
            darknodeRegisteringList: js.darknodeRegisteringList,
            withdrawAddresses: js.withdrawAddresses,
        });
    }

    public deserialize(str: string): PersistentNetworkState {
        // let next = this;
        try {
            const data = JSON.parse(str);
            return new PersistentNetworkState({
                quoteCurrency: data.quoteCurrency,
                darknodeList: data.darknodeList,
                darknodeNames: data.darknodeNames,
                darknodeRegisteringList: data.darknodeRegisteringList,
                withdrawAddresses: data.withdrawAddresses,
            });
        } catch (error) {
            _catchBackgroundException_(error, "Error in applicationState > PersistentNetworkState > deserialize");
            return this;
        }
    }
}

export class DarknodesState extends Record({
    ID: "",
    multiAddress: "",
    publicKey: "",
    ethBalance: new BigNumber(0),
    feesEarned: OrderedMap<Token, BigNumber>(),
    oldFeesEarned: OrderedMap<OldToken, BigNumber>(),
    feesEarnedTotalEth: new BigNumber(0),

    cycleStatus: OrderedMap<string, DarknodeFeeStatus>(),

    averageGasUsage: 0,
    lastTopUp: null,
    expectedExhaustion: null,

    peers: 0,
    registrationStatus: "" as RegistrationStatus,
    operator: "",

    nodeStatistics: null as NodeStatistics | null,
}) { }
