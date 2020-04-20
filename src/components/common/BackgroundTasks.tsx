import * as React from "react";

import { OrderedSet } from "immutable";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { RouteComponentProps, withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";

import { _catchBackgroundException_ } from "../../lib/react/errors";
import { lookForLogout } from "../../store/account/accountActions";
import { ApplicationState } from "../../store/applicationState";
import { updateTokenPrices } from "../../store/network/networkActions";
import {
    updateCycleAndPendingRewards, updateDarknodeDetails, updateOperatorDarknodes,
} from "../../store/network/operatorActions";
import { PopupContainer } from "../../store/popupStore";
import { AppDispatch } from "../../store/rootReducer";
import { getDarknodeParam } from "../darknodePage/Darknode";

export const asyncSetInterval = (fn: () => Promise<number | void>, onErrorRetry: number, errorMessage: string, timeout: NodeJS.Timer | undefined, setNewTimeout: (timeout: NodeJS.Timer) => void): void => {
    (async () => {
        if (timeout) { clearTimeout(timeout); }
        let retry = onErrorRetry;
        try {
            retry = (await fn() || onErrorRetry);
        } catch (error) {
            if (errorMessage) { _catchBackgroundException_(error, errorMessage); }
        }
        if (timeout) { clearTimeout(timeout); }
        setNewTimeout(setTimeout(asyncSetInterval, retry || onErrorRetry, fn, onErrorRetry, errorMessage, timeout) as unknown as NodeJS.Timer);
    })().catch(error => _catchBackgroundException_(error, "Error in BackgroundTasks: asyncSetInterval"));
};

/**
 * BackgroundTasks is the main visual component responsible for displaying different routes
 * and running background app loops
 */
const BackgroundTasksClass: React.StatelessComponent<Props> = ({ store: { address, web3, tokenPrices, darknodeList, darknodeRegisteringList, renNetwork }, actions, match }) => {
    const { setPopup, clearPopup } = PopupContainer.useContainer();

    const [callUpdatePricesTimeout, setCallUpdatePricesTimeout] = React.useState<NodeJS.Timer | undefined>(undefined);
    const [callUpdateRewardsTimeout, setCallUpdateRewardsTimeout] = React.useState<NodeJS.Timer | undefined>(undefined);
    const [callLookForLogoutInterval, setCallLookForLogoutInterval] = React.useState<NodeJS.Timer | undefined>(undefined);
    const [callUpdateOperatorDarknodesTimeout, setCallUpdateOperatorDarknodesTimeout] = React.useState<NodeJS.Timer | undefined>(undefined);
    const [callUpdateSelectedDarknodeTimeout, setCallUpdateSelectedDarknodeTimeout] = React.useState<NodeJS.Timer | undefined>(undefined);

    const darknodeID = getDarknodeParam(match.params);

    // Update token prices every 60 seconds
    const callUpdatePrices = async (): Promise<void> => {
        asyncSetInterval(actions.updateTokenPrices, 60 * 1000, "Error in BackgroundTasks > callUpdatePrices", callUpdatePricesTimeout, setCallUpdatePricesTimeout);
    };

    // Update rewards every 120 seconds
    const callUpdateRewards = async (): Promise<void> => {
        let retry = 120;
        if (tokenPrices) {
            try {
                // tslint:disable-next-line: await-promise
                await actions.updateCycleAndPendingRewards(web3, renNetwork, tokenPrices);
            } catch (error) {
                _catchBackgroundException_(error, "Error in BackgroundTasks > callUpdateRewards");
            }
        } else {
            retry = 1;
        }
        if (callUpdateRewardsTimeout) { clearTimeout(callUpdateRewardsTimeout); }
        setCallUpdateRewardsTimeout(setTimeout(callUpdateRewards, retry * 1000) as unknown as NodeJS.Timer);
    };

    // See if the user has logged out every 5 seconds
    const callLookForLogout = async (): Promise<void> => {
        if (address) {
            await (actions.lookForLogout(setPopup, clearPopup) as unknown as Promise<void>).catch((error) => {
                _catchBackgroundException_(error, "Error in BackgroundTasks > callLookForLogout");
            });
        }
    };

    // Update operator statistics every 120 seconds
    const callUpdateOperatorDarknodes = async (): Promise<void> => {
        let timeout = 1; // Retry in a second, unless the call succeeds
        if (address) {
            try {
                let list = null;
                if (darknodeRegisteringList.size > 0) {
                    list = darknodeRegisteringList.keySeq().toOrderedSet();
                }
                if (darknodeList) {
                    list = (list || OrderedSet()).merge(darknodeList);
                }
                // tslint:disable-next-line: await-promise
                await actions.updateOperatorDarknodes(web3, renNetwork, address, tokenPrices, list);
                timeout = 120;
            } catch (error) {
                _catchBackgroundException_(error, "Error in BackgroundTasks > callUpdateOperatorDarknodes");
                timeout = 10;
            }
        }
        if (callUpdateOperatorDarknodesTimeout) { clearTimeout(callUpdateOperatorDarknodesTimeout); }
        setCallUpdateOperatorDarknodesTimeout(setTimeout(
            callUpdateOperatorDarknodes,
            timeout * 1000,
        ) as unknown as NodeJS.Timer);
    };

    // Update selected darknode statistics every 30 seconds
    const callUpdateSelectedDarknode = async (): Promise<void> => {
        let timeout = 1; // if the action isn't called, try again in 1 second
        if (tokenPrices && darknodeID) {
            try {
                // tslint:disable-next-line: await-promise
                await actions.updateDarknodeDetails(
                    web3,
                    renNetwork,
                    darknodeID,
                    tokenPrices,
                );
                timeout = 30;
            } catch (error) {
                _catchBackgroundException_(error, "Error in BackgroundTasks > callUpdateSelectedDarknode");
                timeout = 15; // try again in half the time
            }
        }
        if (callUpdateSelectedDarknodeTimeout) { clearTimeout(callUpdateSelectedDarknodeTimeout); }
        setCallUpdateSelectedDarknodeTimeout(setTimeout(
            callUpdateSelectedDarknode,
            timeout * 1000,
        ) as unknown as NodeJS.Timer);
    };

    React.useEffect(() => {
        callUpdatePrices().catch(error => {
            _catchBackgroundException_(error, "Error in BackgroundTasks > callUpdatePrices");
        });
        callUpdateRewards().catch(error => {
            _catchBackgroundException_(error, "Error in BackgroundTasks > callUpdateRewards");
        });

        setCallLookForLogoutInterval(setInterval(callLookForLogout, 5000));

        return () => {
            // Clear timeouts
            if (callUpdatePricesTimeout) { clearTimeout(callUpdatePricesTimeout); }
            if (callUpdateRewardsTimeout) { clearTimeout(callUpdateRewardsTimeout); }
            if (callLookForLogoutInterval) { clearTimeout(callLookForLogoutInterval); }
            if (callUpdateOperatorDarknodesTimeout) { clearTimeout(callUpdateOperatorDarknodesTimeout); }
            if (callUpdateSelectedDarknodeTimeout) { clearTimeout(callUpdateSelectedDarknodeTimeout); }
        };
    }, []);

    React.useEffect(() => {
        callUpdateOperatorDarknodes().catch(error => {
            _catchBackgroundException_(error, "Error in BackgroundTasks > callUpdateOperatorDarknodes ");
        });
    }, [address]);

    React.useEffect(() => {
        callUpdateSelectedDarknode().catch(error => {
            _catchBackgroundException_(error, "Error in BackgroundTasks > callUpdateSelectedDarknode");
        });
    }, [darknodeID]);

    return <></>;
};

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        address: state.account.address,
        web3: state.account.web3,
        tokenPrices: state.network.tokenPrices,
        darknodeList: state.account.address ? state.network.darknodeList.get(state.account.address, null) : null,
        darknodeRegisteringList: state.network.darknodeRegisteringList,
        renNetwork: state.account.renNetwork,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        updateTokenPrices,
        updateCycleAndPendingRewards,
        lookForLogout,
        updateOperatorDarknodes,
        updateDarknodeDetails,
    }, dispatch),
});

interface Props extends
    ReturnType<typeof mapStateToProps>,
    ConnectedReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {
}

export const BackgroundTasks = connect(mapStateToProps, mapDispatchToProps)(withRouter(BackgroundTasksClass));
