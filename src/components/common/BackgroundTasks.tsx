// import * as qs from "query-string";
import * as React from "react";

import { OrderedSet } from "immutable";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { RouteComponentProps, withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";

import { _catchBackgroundException_ } from "../../lib/react/errors";
import { lookForLogout, promptLogin } from "../../store/account/accountActions";
import { ApplicationState } from "../../store/applicationState";
import { updateTokenPrices } from "../../store/network/networkActions";
import {
    updateCycleAndPendingRewards, updateDarknodeDetails, updateOperatorDarknodes,
} from "../../store/network/operatorActions";
import { AppDispatch } from "../../store/rootReducer";
import { getDarknodeParam } from "../darknodePage/Darknode";

export const asyncSetInterval = (fn: () => Promise<number | void>, onErrorRetry: number, errorMessage: string, timeout: { timeout: NodeJS.Timer | undefined }): void => {
    (async () => {
        if (timeout.timeout) { clearTimeout(timeout.timeout); }
        let retry = onErrorRetry;
        try {
            retry = (await fn() || onErrorRetry);
        } catch (error) {
            if (errorMessage) { _catchBackgroundException_(error, errorMessage); }
        }
        if (timeout.timeout) { clearTimeout(timeout.timeout); }
        timeout.timeout = setTimeout(asyncSetInterval, retry || onErrorRetry, fn, onErrorRetry, errorMessage, timeout) as unknown as NodeJS.Timer;
    })().catch(error => _catchBackgroundException_(error, "Error in BackgroundTasks: asyncSetInterval"));
};

/**
 * BackgroundTasks is the main visual component responsible for displaying different routes
 * and running background app loops
 */
class BackgroundTasksClass extends React.Component<Props> {
    private readonly callUpdatePricesTimeout: { timeout: NodeJS.Timer | undefined } = { timeout: undefined };
    private readonly callUpdateRewardsTimeout: { timeout: NodeJS.Timer | undefined } = { timeout: undefined };
    private readonly callLookForLogoutInterval: { timeout: NodeJS.Timer | undefined } = { timeout: undefined };
    private readonly callUpdateOperatorDarknodesTimeout: { timeout: NodeJS.Timer | undefined } = { timeout: undefined };
    private readonly callUpdateSelectedDarknodeTimeout: { timeout: NodeJS.Timer | undefined } = { timeout: undefined };

    public componentDidMount = async (): Promise<void> => {
        // const { match: { params }, store: { renNetwork } } = this.props;

        // const darknodeID = getDarknodeParam(params);

        // const queryParams = qs.parse(this.props.location.search);
        // const action = typeof queryParams.action === "string" ? queryParams.action : undefined;

        // Sometimes, logging in seems to freeze, to we start loops that don't
        // rely on being logged in before attempting to log in
        this.setupLoops();

        // TODO: Detect if web3 is already connected

        // try {
        //     await this.props.actions.login(
        //         renNetwork,
        //         {
        //             redirect: false,
        //             showPopup: darknodeID === undefined || action !== undefined,
        //             immediatePopup: false,
        //         }
        //     );
        // } catch (error) {
        //     _catchBackgroundException_(error, {
        //         description: "Error logging in on load",
        //     });
        // }

        this.setupLoopsWithAccount();
    }

    public componentWillReceiveProps = (nextProps: Props): void => {
        if (this.props.store.address !== nextProps.store.address) {
            this.callUpdateOperatorDarknodes(nextProps).catch(error => {
                _catchBackgroundException_(error, "Error in BackgroundTasks > callUpdateOperatorDarknodes ");
            });
        }

        const { match: { params: nextParams } } = nextProps;
        const { match: { params } } = this.props;

        const nextDarknodeID = getDarknodeParam(nextParams);
        const darknodeID = getDarknodeParam(params);

        if (darknodeID !== nextDarknodeID) {
            this.callUpdateSelectedDarknode(nextProps).catch(error => {
                _catchBackgroundException_(error, "Error in BackgroundTasks > callUpdateSelectedDarknode");
            });
        }
    }

    public componentWillUnmount(): void {
        // Clear timeouts
        if (this.callUpdatePricesTimeout.timeout) { clearTimeout(this.callUpdatePricesTimeout.timeout); }
        if (this.callUpdateRewardsTimeout.timeout) { clearTimeout(this.callUpdateRewardsTimeout.timeout); }
        if (this.callLookForLogoutInterval.timeout) { clearTimeout(this.callLookForLogoutInterval.timeout); }
        if (this.callUpdateOperatorDarknodesTimeout.timeout) { clearTimeout(this.callUpdateOperatorDarknodesTimeout.timeout); }
        if (this.callUpdateSelectedDarknodeTimeout.timeout) { clearTimeout(this.callUpdateSelectedDarknodeTimeout.timeout); }
    }

    public render = (): JSX.Element => <></>;

    // Update token prices every 60 seconds
    private readonly callUpdatePrices = async (): Promise<void> => {
        asyncSetInterval(this.props.actions.updateTokenPrices, 60 * 1000, "Error in BackgroundTasks > callUpdatePrices", this.callUpdatePricesTimeout);
    }

    // Update rewards every 120 seconds
    private readonly callUpdateRewards = async (): Promise<void> => {
        const { web3, renNetwork, tokenPrices } = this.props.store;
        let retry = 120;
        if (tokenPrices) {
            try {
                // tslint:disable-next-line: await-promise
                await this.props.actions.updateCycleAndPendingRewards(web3, renNetwork, tokenPrices);
            } catch (error) {
                _catchBackgroundException_(error, "Error in BackgroundTasks > callUpdateRewards");
            }
        } else {
            retry = 1;
        }
        if (this.callUpdateRewardsTimeout.timeout) { clearTimeout(this.callUpdateRewardsTimeout.timeout); }
        this.callUpdateRewardsTimeout.timeout = setTimeout(this.callUpdateRewards, retry * 1000) as unknown as NodeJS.Timer;
    }

    // See if the user has logged out every 5 seconds
    private readonly callLookForLogout = async (): Promise<void> => {
        if (this.props.store.address) {
            await (this.props.actions.lookForLogout() as unknown as Promise<void>).catch((error) => {
                _catchBackgroundException_(error, "Error in BackgroundTasks > callLookForLogout");
            });
        }
    }

    // Update operator statistics every 120 seconds
    private readonly callUpdateOperatorDarknodes = async (props?: Props): Promise<void> => {
        props = props || this.props;

        const { web3, address, tokenPrices, darknodeList, darknodeRegisteringList, renNetwork } = props.store;
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
                await props.actions.updateOperatorDarknodes(web3, renNetwork, address, tokenPrices, list);
                timeout = 120;
            } catch (error) {
                _catchBackgroundException_(error, "Error in BackgroundTasks > callUpdateOperatorDarknodes");
                timeout = 10;
            }
        }
        if (this.callUpdateOperatorDarknodesTimeout.timeout) { clearTimeout(this.callUpdateOperatorDarknodesTimeout.timeout); }
        this.callUpdateOperatorDarknodesTimeout.timeout = setTimeout(
            this.callUpdateOperatorDarknodes,
            timeout * 1000,
        ) as unknown as NodeJS.Timer;
    }

    // Update selected darknode statistics every 30 seconds
    private readonly callUpdateSelectedDarknode = async (props?: Props): Promise<void> => {
        props = props || this.props;

        const { match: { params } } = props;
        const { web3, tokenPrices, renNetwork } = props.store;

        const darknodeID = getDarknodeParam(params);

        let timeout = 1; // if the action isn't called, try again in 1 second
        if (tokenPrices && darknodeID) {
            try {
                // tslint:disable-next-line: await-promise
                await props.actions.updateDarknodeDetails(
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
        if (this.callUpdateSelectedDarknodeTimeout.timeout) { clearTimeout(this.callUpdateSelectedDarknodeTimeout.timeout); }
        this.callUpdateSelectedDarknodeTimeout.timeout = setTimeout(
            this.callUpdateSelectedDarknode,
            timeout * 1000,
        ) as unknown as NodeJS.Timer;
    }

    // tslint:disable-next-line:member-ordering
    public setupLoops(): void {
        this.callUpdatePrices().catch(error => {
            _catchBackgroundException_(error, "Error in BackgroundTasks > callUpdatePrices");
        });
        this.callUpdateRewards().catch(error => {
            _catchBackgroundException_(error, "Error in BackgroundTasks > callUpdateRewards");
        });
        this.callUpdateSelectedDarknode().catch(error => {
            _catchBackgroundException_(error, "Error in BackgroundTasks > callUpdateSelectedDarknode");
        });
    }

    // tslint:disable-next-line:member-ordering
    public setupLoopsWithAccount(): void {
        this.callLookForLogoutInterval.timeout = setInterval(this.callLookForLogout, 5000);
        this.callUpdateOperatorDarknodes().catch(error => {
            _catchBackgroundException_(error, "Error in BackgroundTasks > callUpdateOperatorDarknodes");
        });
    }

}

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
        promptLogin,
        lookForLogout,
        updateTokenPrices,
        updateOperatorDarknodes,
        updateDarknodeDetails,
        updateCycleAndPendingRewards,
    }, dispatch),
});

interface Props extends
    ReturnType<typeof mapStateToProps>,
    ConnectedReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {
}

export const BackgroundTasks = connect(mapStateToProps, mapDispatchToProps)(withRouter(BackgroundTasksClass));
