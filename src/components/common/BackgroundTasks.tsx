import * as React from "react";

import { RouteComponentProps, withRouter } from "react-router-dom";

import { catchBackgroundException } from "../../lib/react/errors";
import { NetworkStateContainer } from "../../store/networkStateContainer";
import { Web3Container } from "../../store/web3Store";
import { getDarknodeParam } from "../darknodePage/DarknodePage";

export const SECONDS = 1000;

interface Props extends RouteComponentProps {
}

/**
 * BackgroundTasks is the main visual component responsible for displaying different routes
 * and running background app loops
 */
export const BackgroundTasks = withRouter(({ match }: Props) => {
    const { address, lookForLogout } = Web3Container.useContainer();
    const { tokenPrices, updateTokenPrices, updateCycleAndPendingRewards, updateOperatorDarknodes, updateDarknodeDetails } = NetworkStateContainer.useContainer();

    const darknodeID = getDarknodeParam(match.params);

    // Update token prices every 60 seconds
    const [pricesTimeout, setPricesTimeout] = React.useState<NodeJS.Timer | undefined>(undefined);
    const [pricesTrigger, setPricesTrigger] = React.useState(0);
    React.useEffect(() => {
        (async () => {
            let retry = 120;
            const errorRetry = 20;
            try {
                await updateTokenPrices();
            } catch (error) {
                catchBackgroundException(error, "Error in BackgroundTasks > updateTokenPrices");
                retry = errorRetry;
            }
            if (pricesTimeout) { clearTimeout(pricesTimeout); }
            setPricesTimeout(setTimeout(() => setPricesTrigger(pricesTrigger + 1), retry * SECONDS) as unknown as NodeJS.Timer);
        })().catch((error) => {
            catchBackgroundException(error, "Error in BackgroundTasks > updateTokenPrices");
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pricesTrigger]);

    // Update rewards every 120 seconds
    const [rewardsTimeout, setRewardsTimeout] = React.useState<NodeJS.Timer | undefined>(undefined);
    const [rewardsTrigger, setRewardsTrigger] = React.useState(0);
    React.useEffect(() => {
        (async () => {
            let retry = address ? 120 : 240;
            if (tokenPrices) {
                try {
                    await updateCycleAndPendingRewards();
                } catch (error) {
                    catchBackgroundException(error, "Error in BackgroundTasks > callUpdateRewards");
                }
            } else {
                retry = 1;
            }
            if (rewardsTimeout) { clearTimeout(rewardsTimeout); }
            setRewardsTimeout(setTimeout(() => setRewardsTrigger(rewardsTrigger + 1), retry * SECONDS) as unknown as NodeJS.Timer);
        })().catch(error => {
            catchBackgroundException(error, "Error in BackgroundTasks > callUpdateRewards");
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rewardsTrigger]);

    // See if the user has logged out every 5 seconds
    const [logoutTimeout, setLogoutTimeout] = React.useState<NodeJS.Timer | undefined>(undefined);
    const [logoutTrigger, setLogoutTrigger] = React.useState(0);
    React.useEffect(() => {
        (async () => {
            const retry = 5;
            if (logoutTrigger > 0 && address) {
                await (lookForLogout() as unknown as Promise<void>).catch((error) => {
                    catchBackgroundException(error, "Error in BackgroundTasks > callLookForLogout");
                });
            }
            if (logoutTimeout) { clearTimeout(logoutTimeout); }
            setLogoutTimeout(setTimeout(() => setLogoutTrigger(logoutTrigger + 1), retry * SECONDS) as unknown as NodeJS.Timer);
        })().catch((error) => {
            catchBackgroundException(error, "Error in BackgroundTasks > callLookForLogout");
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logoutTrigger]);

    // Update operator statistics every 120 seconds, or when the user changes
    // their account.
    const [operatorDarknodesTimeout, setOperatorDarknodesTimeout] = React.useState<NodeJS.Timer | undefined>(undefined);
    const [operatorDarknodesTrigger, setOperatorDarknodesTrigger] = React.useState(0);
    const operatorDarknodesTriggers = [operatorDarknodesTrigger, address];
    React.useEffect(() => {
        (async () => {
            let timeout = 1; // Retry in a second, unless the call succeeds
            if (address) {
                try {
                    await updateOperatorDarknodes();
                    timeout = 120;
                } catch (error) {
                    catchBackgroundException(error, "Error in BackgroundTasks > callUpdateOperatorDarknodes");
                    timeout = 10;
                }
            }
            if (operatorDarknodesTimeout) { clearTimeout(operatorDarknodesTimeout); }
            setOperatorDarknodesTimeout(setTimeout(
                () => setOperatorDarknodesTrigger(operatorDarknodesTrigger + 1),
                timeout * SECONDS,
            ) as unknown as NodeJS.Timer);
        })().catch(error => catchBackgroundException(error, "Error in BackgroundTasks > callUpdateOperatorDarknodes"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, operatorDarknodesTriggers);

    // Update selected darknode statistics every 120 seconds, or when the
    // selected Darknode changes;
    const [selectedDarknodeTimeout, setSelectedDarknodeTimeout] = React.useState<NodeJS.Timer | undefined>(undefined);
    const [selectedDarknodeTrigger, setSelectedDarknodeTrigger] = React.useState(0);
    const selectedDarknodeTriggers = [selectedDarknodeTrigger, darknodeID];
    React.useEffect(() => {
        (async () => {
            let timeout = 1; // if the action isn't called, try again in 1 second
            if (tokenPrices && darknodeID) {
                try {
                    await updateDarknodeDetails(darknodeID);
                    timeout = 120;
                } catch (error) {
                    catchBackgroundException(error, "Error in BackgroundTasks > callUpdateSelectedDarknode");
                    timeout = 15; // try again in half the time
                }
            }
            if (selectedDarknodeTimeout) { clearTimeout(selectedDarknodeTimeout); }
            setSelectedDarknodeTimeout(setTimeout(
                () => setSelectedDarknodeTrigger(selectedDarknodeTrigger + 1),
                timeout * SECONDS,
            ) as unknown as NodeJS.Timer);
        })().catch(error => catchBackgroundException(error, "Error in BackgroundTasks > callUpdateSelectedDarknode"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, selectedDarknodeTriggers);

    React.useEffect(() => {
        // Clear timeouts when the BackgroundTasks component is unmounted.
        return () => {
            if (pricesTimeout) { clearTimeout(pricesTimeout); }
            if (rewardsTimeout) { clearTimeout(rewardsTimeout); }
            if (logoutTimeout) { clearTimeout(logoutTimeout); }
            if (operatorDarknodesTimeout) { clearTimeout(operatorDarknodesTimeout); }
            if (selectedDarknodeTimeout) { clearTimeout(selectedDarknodeTimeout); }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <></>;
});
