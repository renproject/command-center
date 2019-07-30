// tslint:disable:no-object-literal-type-assertion

import { RenNetwork, RenNetworkDetails, RenNetworks } from "@renproject/contracts";
import { Currency, Record } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { List, Map, OrderedMap } from "immutable";
import { PromiEvent } from "web3-core";

import { DarknodeFeeStatus } from "../lib/darknodeFeeStatus";
import { Web3Browser } from "../lib/ethereum/browsers";
import { RegistrationStatus } from "../lib/ethereum/network";
import { OldToken, Token } from "../lib/ethereum/tokens";
import { readOnlyWeb3 } from "../lib/ethereum/wallet";
import { DEFAULT_REN_NETWORK } from "../lib/react/environmentVariables";
import { _captureBackgroundException_ } from "../lib/react/errors";
import { Serializable } from "../lib/react/serializable";
import { TokenPrices } from "../lib/tokenPrices";

export interface ApplicationState {
    account: AccountState;
    popup: PopupState;
    statistics: StatisticsState;
    ui: UIState;
}

export class AccountState extends Record({
    // Login data
    address: null as string | null,
    web3BrowserName: Web3Browser.MetaMask,
    web3: readOnlyWeb3,

    renNetwork: RenNetworks[DEFAULT_REN_NETWORK || RenNetwork.Testnet] as RenNetworkDetails,
}) implements Serializable<AccountState> {
    public serialize(): string {
        // const js = this.toJS();
        return JSON.stringify({
            renNetwork: this.renNetwork.name,
        });
    }

    public deserialize(str: string): AccountState {
        // let next = this;
        try {
            const data = JSON.parse(str);
            // tslint:disable-next-line: no-any
            let accountData = new AccountState();
            if (data.renNetwork) {
                accountData = accountData.set("renNetwork", RenNetworks[data.renNetwork]);
            }
            return accountData;
        } catch (error) {
            _captureBackgroundException_(error, {
                description: "Cannot deserialize local storage",
            });
            return this;
        }
    }
}

export class PopupState extends Record({
    dismissible: true,
    onCancel: (() => null) as () => void,
    popup: null as JSX.Element | null,
    overlay: false,
}) { }

export class UIState extends Record({
    mobileMenuActive: false,
}) { }

export class StatisticsState extends Record({
    secondsPerBlock: null as number | null,

    tokenPrices: null as TokenPrices | null,
    quoteCurrency: Currency.USD,

    darknodeCount: null as BigNumber | null,
    orderCount: null as BigNumber | null,

    darknodeDetails: Map<string, DarknodesState>(),

    balanceHistories: Map<string, OrderedMap<number, BigNumber>>(),

    darknodeNames: Map<string, string>(),
    darknodeRegisteringList: Map<string, string>(),
    darknodeList: Map<string, List<string>>(),

    // tslint:disable-next-line: no-any
    transactions: OrderedMap<string, PromiEvent<any>>(),
    confirmations: OrderedMap<string, number>(),

    withdrawAddresses: Map<Token, List<string>>(),

    currentCycle: "",
    previousCycle: "",
    pendingRewards: OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>(),
    pendingTotalInEth: OrderedMap<string /* cycle */, BigNumber>(),
    cycleTimeout: new BigNumber(0),
}) implements Serializable<StatisticsState> {
    public serialize(): string {
        const js = this.toJS();
        return JSON.stringify({
            darknodeList: js.darknodeList,
            darknodeNames: js.darknodeNames,
            darknodeRegisteringList: js.darknodeRegisteringList,
            withdrawAddresses: js.withdrawAddresses,
        });
    }

    public deserialize(str: string): StatisticsState {
        // let next = this;
        try {
            const data = JSON.parse(str);
            return new StatisticsState({
                darknodeList: data.darknodeList,
                darknodeNames: data.darknodeNames,
                darknodeRegisteringList: data.darknodeRegisteringList,
                withdrawAddresses: data.withdrawAddresses,
            });
        } catch (error) {
            _captureBackgroundException_(error, {
                description: "Cannot deserialize local storage",
            });
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
}) { }
