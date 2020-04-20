import * as React from "react";

import { connect } from "react-redux"; // Custom typings

import { ApplicationState } from "../store/applicationState";
import { NetworkStateContainer } from "../store/networkStateContainer";

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        network: state.network,
    }
});

interface Props extends ReturnType<typeof mapStateToProps> {
}

export const ReduxToContainers = connect(mapStateToProps)(({ store: { network } }: Props) => {
    const networkStateContainer = NetworkStateContainer.useContainer();

    // Update Network container

    React.useEffect(() => {
        networkStateContainer.setDarknodeCount(network.darknodeCount);
    }, [network, network.darknodeCount]);
    React.useEffect(() => {
        networkStateContainer.setOrderCount(network.orderCount);
    }, [network, network.orderCount]);
    React.useEffect(() => {
        networkStateContainer.setRegistrySync(network.registrySync);
    }, [network, network.registrySync.progress, network.registrySync.target]);
    React.useEffect(() => {
        networkStateContainer.setDarknodeDetails(network.darknodeDetails);
    }, [network, network.darknodeDetails]);
    React.useEffect(() => {
        networkStateContainer.setTransactions(network.transactions);
    }, [network, network.transactions]);
    React.useEffect(() => {
        networkStateContainer.setConfirmations(network.confirmations);
    }, [network, network.confirmations]);
    React.useEffect(() => {
        networkStateContainer.setCurrentCycle(network.currentCycle);
    }, [network, network.currentCycle]);
    React.useEffect(() => {
        networkStateContainer.setPreviousCycle(network.previousCycle);
    }, [network, network.previousCycle]);
    React.useEffect(() => {
        networkStateContainer.setPendingRewards(network.pendingRewards);
    }, [network, network.pendingRewards]);
    React.useEffect(() => {
        networkStateContainer.setPendingTotalInEth(network.pendingTotalInEth);
    }, [network, network.pendingTotalInEth]);
    React.useEffect(() => {
        networkStateContainer.setPendingRewardsInEth(network.pendingRewardsInEth);
    }, [network, network.pendingRewardsInEth]);
    React.useEffect(() => {
        networkStateContainer.setCycleTimeout(network.cycleTimeout);
    }, [network, network.cycleTimeout]);
    React.useEffect(() => {
        networkStateContainer.setCurrentShareCount(network.currentShareCount);
    }, [network, network.currentShareCount]);
    React.useEffect(() => {
        networkStateContainer.setCurrentDarknodeCount(network.currentDarknodeCount);
    }, [network, network.currentDarknodeCount]);
    React.useEffect(() => {
        networkStateContainer.setPreviousDarknodeCount(network.previousDarknodeCount);
    }, [network, network.previousDarknodeCount]);
    React.useEffect(() => {
        networkStateContainer.setNextDarknodeCount(network.nextDarknodeCount);
    }, [network, network.nextDarknodeCount]);
    React.useEffect(() => {
        networkStateContainer.setQuoteCurrency(network.quoteCurrency);
    }, [network, network.quoteCurrency]);
    React.useEffect(() => {
        networkStateContainer.setDarknodeNames(network.darknodeNames);
    }, [network, network.darknodeNames]);
    React.useEffect(() => {
        networkStateContainer.setDarknodeRegisteringList(network.darknodeRegisteringList);
    }, [network, network.darknodeRegisteringList]);
    React.useEffect(() => {
        networkStateContainer.setDarknodeList(network.darknodeList);
    }, [network, network.darknodeList]);
    // React.useEffect(() => {
    //     networkStateContainer.setHiddenDarknodes(network.hiddenDarknodes);
    // }, [network, network.hiddenDarknodes]);
    React.useEffect(() => {
        networkStateContainer.setWithdrawAddresses(network.withdrawAddresses);
    }, [network, network.withdrawAddresses]);
    return <></>;
});
