import * as React from "react";

import { RouteComponentProps, withRouter } from "react-router-dom";

import { useTaskSchedule } from "../../hooks/useTaskSchedule";
import { catchBackgroundException } from "../../lib/react/errors";
import { GraphContainer } from "../../store/graphStore";
import { NetworkContainer } from "../../store/networkContainer";
import { Web3Container } from "../../store/web3Store";
import { getDarknodeParam } from "../operatorPages/darknodePage/DarknodePage";

export const SECONDS = 1000;

interface Props extends RouteComponentProps {
}

/**
 * BackgroundTasks is the main visual component responsible for displaying different routes
 * and running background app loops
 */
export const BackgroundTasks = withRouter(({ match }: Props) => {
    const { address, lookForLogout } = Web3Container.useContainer();
    const { tokenPrices, updateTokenPrices, updateCycleAndPendingRewards, updateOperatorDarknodes, updateDarknodeDetails } = NetworkContainer.useContainer();
    const { renVM } = GraphContainer.useContainer();

    const darknodeID = getDarknodeParam(match.params);

    // Update token prices every 60 seconds
    const priceUpdater = React.useCallback(async () => {
        try {
            await updateTokenPrices();
            return 60; // seconds
        } catch (error) {
            catchBackgroundException(error, "Error in BackgroundTasks > priceUpdater");
            return 15;
        }
    }, [updateTokenPrices]);
    useTaskSchedule(priceUpdater);

    // Update rewards every 120 seconds
    const rewardsUpdater = React.useCallback(async () => {
        try {
            if (renVM && tokenPrices) {
                await updateCycleAndPendingRewards();
                return address ? 120 : 300; // seconds
            }
            return 1; // second
        } catch (error) {
            catchBackgroundException(error, "Error in BackgroundTasks > rewardsUpdater");
            return 15; // seconds
        }
    }, [renVM, tokenPrices, address, updateCycleAndPendingRewards]);
    useTaskSchedule(rewardsUpdater);

    const loggedOutUpdater = React.useCallback(async () => {
        if (address) {
            try {
                await (lookForLogout() as unknown as Promise<void>).catch((error) => {
                    catchBackgroundException(error, "Error in BackgroundTasks > loggedOutUpdater");
                });
            } catch (error) {
                catchBackgroundException(error, "Error in BackgroundTasks > loggedOutUpdater");
            }
        }
        return 5; // seconds
    }, [address, lookForLogout]);
    useTaskSchedule(loggedOutUpdater);

    const operatorStatsUpdater = React.useCallback(async () => {
        if (tokenPrices && address) {
            try {
                await updateOperatorDarknodes(darknodeID);
                return 120; // seconds
            } catch (error) {
                catchBackgroundException(error, "Error in BackgroundTasks > operatorStatsUpdater");
                return 10; // seconds
            }
        }
        return 1; // second
    }, [tokenPrices, address, darknodeID, updateOperatorDarknodes]);
    useTaskSchedule(operatorStatsUpdater, [address]);

    const selectedDarknodeUpdater = React.useCallback(async () => {
        if (tokenPrices && darknodeID) {
            try {
                await updateDarknodeDetails(darknodeID);
                return 60; // seconds
            } catch (error) {
                catchBackgroundException(error, "Error in BackgroundTasks > selectedDarknodeUpdater");
                return 15; // seconds
            }
        }
        return 1;
    }, [tokenPrices, darknodeID, updateDarknodeDetails]);
    useTaskSchedule(selectedDarknodeUpdater, [darknodeID]);

    return <></>;
});
