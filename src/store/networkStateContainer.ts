
import { Currency } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { List, Map, OrderedMap, OrderedSet } from "immutable";
import { useState } from "react";
import { useStorageState } from "react-storage-hooks";
import { createContainer } from "unstated-next";
import Web3 from "web3";
import { PromiEvent } from "web3-core";

import {
    calculateSecondsPerBlock, fetchDarknodeBalanceHistory, HistoryPeriod,
} from "../lib/ethereum/contractReads";
import { getPrices, Token, TokenPrices } from "../lib/ethereum/tokens";
import { _catchBackgroundException_, _catchInteractionException_ } from "../lib/react/errors";
import { DarknodesState } from "./applicationState";

const useNetworkStateContainer = () => {
    const [secondsPerBlock, setSecondsPerBlock] = useState(null as number | null);

    const [tokenPrices, setTokenPrices] = useState(null as TokenPrices | null);

    const [darknodeCount, setDarknodeCount] = useState(null as BigNumber | null);
    const [orderCount, setOrderCount] = useState(null as BigNumber | null);

    const [registrySync, setRegistrySync] = useState({ progress: 0, target: 0 });

    const [darknodeDetails, setDarknodeDetails] = useState(Map<string, DarknodesState>());

    const [balanceHistories, setBalanceHistories] = useState(Map<string, OrderedMap<number, BigNumber>>());

    // tslint:disable-next-line: no-any
    const [transactions, setTransactions] = useState(OrderedMap<string, PromiEvent<any>>());
    const [confirmations, setConfirmations] = useState(OrderedMap<string, number>());

    const [currentCycle, setCurrentCycle] = useState("");
    const [previousCycle, setPreviousCycle] = useState("");
    const [pendingRewards, setPendingRewards] = useState(OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>());
    const [pendingTotalInEth, setPendingTotalInEth] = useState(OrderedMap<string /* cycle */, BigNumber>());
    const [pendingRewardsInEth, setPendingRewardsInEth] = useState(OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>());
    const [cycleTimeout, setCycleTimeout] = useState(new BigNumber(0));
    const [currentShareCount, setCurrentShareCount] = useState(new BigNumber(1));

    const [currentDarknodeCount, setCurrentDarknodeCount] = useState(null as number | null);
    const [previousDarknodeCount, setPreviousDarknodeCount] = useState(null as number | null);
    const [nextDarknodeCount, setNextDarknodeCount] = useState(null as number | null);

    ///////////////////////////////////////////////////////////
    // If these change, localstorage migration may be needed //
    ///////////////////////////////////////////////////////////
    const [quoteCurrency, setQuoteCurrency] = useState(Currency.USD);
    const [darknodeNames, setDarknodeNames] = useState(Map<string, string>());
    const [darknodeRegisteringList, setDarknodeRegisteringList] = useState(Map<string, string>());
    // Map from operator-address to list of darknodes.
    const [darknodeList, setDarknodeList] = useState(Map<string, OrderedSet<string>>());
    const [hiddenDarknodes, setHiddenDarknodes] = useStorageState(localStorage, "hiddenDarknodes", Map<string, OrderedSet<string>>());
    const [withdrawAddresses, setWithdrawAddresses] = useState(Map<Token, List<string>>());
    ///////////////////////////////////////////////////////

    const updateTokenPrices = async () => {
        try {
            setTokenPrices(await getPrices());
        } catch (error) {
            _catchBackgroundException_(error, "Error in networkActions > updateTokenPrices");
        }
    };

    const updateSecondsPerBlock = async (web3: Web3) => {
        const newSecondsPerBlock = await calculateSecondsPerBlock(web3);
        if (newSecondsPerBlock !== null) {
            setSecondsPerBlock(newSecondsPerBlock);
        }
    };

    const updateDarknodeBalanceHistory = async (
        web3: Web3,
        darknodeID: string,
        previousHistory: OrderedMap<number, BigNumber> | null,
        historyPeriod: HistoryPeriod,
        useSecondsPerBlock: number,
    ) => {
        const balanceHistory = await fetchDarknodeBalanceHistory(web3, darknodeID, previousHistory, historyPeriod, useSecondsPerBlock);
        setBalanceHistories(balanceHistories.set(
            darknodeID,
            balanceHistory,
        ));
    };

    const hideDarknode = ({ darknodeID, operator }: { darknodeID: string, operator: string, network: string, }) => {
        try {
            let operatorHiddenDarknodes = hiddenDarknodes.get(operator) || OrderedSet<string>();

            operatorHiddenDarknodes = operatorHiddenDarknodes.add(darknodeID);

            setHiddenDarknodes(hiddenDarknodes.set(operator, operatorHiddenDarknodes));
        } catch (error) {
            _catchInteractionException_(error, "Error in networkReducer > removeDarknode");
        }
    };

    const unhideDarknode = ({ darknodeID, operator, network }: { darknodeID: string, operator: string, network: string, }) => {
        try {
            let operatorHiddenDarknodes = hiddenDarknodes.get(operator) || OrderedSet<string>();

            operatorHiddenDarknodes = operatorHiddenDarknodes.remove(darknodeID);

            setHiddenDarknodes(hiddenDarknodes.set(operator, operatorHiddenDarknodes));
        } catch (error) {
            _catchInteractionException_(error, "Error in networkReducer > removeDarknode");
        }
    };


    return {
        secondsPerBlock,
        tokenPrices,
        darknodeCount, setDarknodeCount,
        orderCount, setOrderCount,
        registrySync, setRegistrySync,
        darknodeDetails, setDarknodeDetails,
        balanceHistories, setBalanceHistories,
        transactions, setTransactions,
        confirmations, setConfirmations,
        currentCycle, setCurrentCycle,
        previousCycle, setPreviousCycle,
        pendingRewards, setPendingRewards,
        pendingTotalInEth, setPendingTotalInEth,
        pendingRewardsInEth, setPendingRewardsInEth,
        cycleTimeout, setCycleTimeout,
        currentShareCount, setCurrentShareCount,
        currentDarknodeCount, setCurrentDarknodeCount,
        previousDarknodeCount, setPreviousDarknodeCount,
        nextDarknodeCount, setNextDarknodeCount,
        quoteCurrency, setQuoteCurrency,
        darknodeNames, setDarknodeNames,
        darknodeRegisteringList, setDarknodeRegisteringList,
        darknodeList, setDarknodeList,
        hiddenDarknodes, setHiddenDarknodes,
        withdrawAddresses, setWithdrawAddresses,

        updateTokenPrices, updateSecondsPerBlock, updateDarknodeBalanceHistory,
        hideDarknode, unhideDarknode,
    };
};

export const NetworkStateContainer = createContainer(useNetworkStateContainer);
