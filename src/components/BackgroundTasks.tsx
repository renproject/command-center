import * as qs from "query-string";
import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { RouteComponentProps, withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";

import { _captureBackgroundException_ } from "../lib/react/errors";
import { ApplicationState } from "../store/applicationState";
import { AppDispatch } from "../store/rootReducer";
import { updateNetworkStatistics, updateTokenPrices } from "../store/statistics/networkActions";
import {
    updateDarknodeStatistics, updateOperatorStatistics,
} from "../store/statistics/operatorActions";
import { login, lookForLogout } from "../store/trader/accountActions";
import { getDarknodeParam } from "./pages/Darknode";

/**
 * BackgroundTasks is the main visual component responsible for displaying different routes
 * and running background app loops
 */
class BackgroundTasksClass extends React.Component<Props> {
    private callUpdatePricesTimeout: NodeJS.Timer | undefined;
    private callLookForLogoutTimeout: NodeJS.Timer | undefined;
    private callUpdateNetworkStatisticsTimeout: NodeJS.Timer | undefined;
    private callUpdateOperatorStatisticsTimeout: NodeJS.Timer | undefined;
    private callUpdateSelectedDarknodeTimeout: NodeJS.Timer | undefined;

    public componentDidMount = async (): Promise<void> => {
        const { match: { params }, store: { renNetwork } } = this.props;

        const darknodeID = getDarknodeParam(params);

        const queryParams = qs.parse(this.props.location.search);
        const action = typeof queryParams.action === "string" ? queryParams.action : undefined;

        // Sometimes, logging in seems to freeze, to we start loops that don't
        // rely on being logged in before attempting to log in
        this.setupLoops();

        try {
            await this.props.actions.login(
                renNetwork,
                {
                    redirect: false,
                    showPopup: darknodeID === undefined || action !== undefined,
                    immediatePopup: false,
                }
            );
        } catch (error) {
            _captureBackgroundException_(error, {
                description: "Error logging in on load",
            });
        }

        this.setupLoopsWithAccount();
    }

    public componentWillReceiveProps = (nextProps: Props): void => {
        if (this.props.store.address !== nextProps.store.address) {
            this.callUpdateOperatorStatistics(nextProps).catch(error => {
                _captureBackgroundException_(error, {
                    description: "Error in callUpdateOperatorStatistics in BackgroundTasks",
                });
            });
        }

        const { match: { params: nextParams } } = nextProps;
        const { match: { params } } = this.props;

        const nextDarknodeID = getDarknodeParam(nextParams);
        const darknodeID = getDarknodeParam(params);

        if (darknodeID !== nextDarknodeID) {
            this.callUpdateSelectedDarknode(nextProps).catch(error => {
                _captureBackgroundException_(error, {
                    description: "Error in callUpdateSelectedDarknode in BackgroundTasks",
                });
            });
        }

    }

    public componentWillUnmount(): void {
        // Clear timeouts
        if (this.callUpdatePricesTimeout) { clearTimeout(this.callUpdatePricesTimeout); }
        if (this.callLookForLogoutTimeout) { clearTimeout(this.callLookForLogoutTimeout); }
        if (this.callUpdateNetworkStatisticsTimeout) { clearTimeout(this.callUpdateNetworkStatisticsTimeout); }
        if (this.callUpdateOperatorStatisticsTimeout) { clearTimeout(this.callUpdateOperatorStatisticsTimeout); }
        if (this.callUpdateSelectedDarknodeTimeout) { clearTimeout(this.callUpdateSelectedDarknodeTimeout); }
    }

    public render = (): JSX.Element => <></>;

    // Update token prices every 60 seconds
    private readonly callUpdatePrices = async (props?: Props): Promise<void> => {
        props = props || this.props;

        try {
            // tslint:disable-next-line: await-promise
            await props.actions.updateTokenPrices();
        } catch (error) {
            _captureBackgroundException_(error, {
                description: "Error thrown in callUpdatePrices background task",
            });
        }
        if (this.callUpdatePricesTimeout) { clearTimeout(this.callUpdatePricesTimeout); }
        this.callUpdatePricesTimeout = setTimeout(this.callUpdatePrices, 60 * 1000) as unknown as NodeJS.Timer;
    }

    // See if the user has logged out every 5 seconds
    private readonly callLookForLogout = async (props?: Props): Promise<void> => {
        props = props || this.props;

        const { address } = props.store;
        if (address) {
            try {
                // tslint:disable-next-line: await-promise
                await props.actions.lookForLogout();
            } catch (error) {
                _captureBackgroundException_(error, {
                    description: "Error thrown in callLookForLogout background task",
                });
            }
        }
        if (this.callLookForLogoutTimeout) { clearTimeout(this.callLookForLogoutTimeout); }
        this.callLookForLogoutTimeout = setTimeout(this.callLookForLogout, 5 * 1000) as unknown as NodeJS.Timer;
    }

    // Update network statistics every 3600 seconds
    private readonly callUpdateNetworkStatistics = async (props?: Props): Promise<void> => {
        props = props || this.props;

        const { web3, renNetwork } = props.store;
        let timeout = 1; // Retry in a second, unless the call succeeds
        try {
            // tslint:disable-next-line: await-promise
            await props.actions.updateNetworkStatistics(web3, renNetwork);
            timeout = 3600;
        } catch (error) {
            if (error && error.message && error.message.match("Cannot read property 'toString' of")) {
                // Ignore
            } else {
                _captureBackgroundException_(error, {
                    description: "Error thrown in callUpdateNetworkStatistics background task",
                });
            }
        }
        if (this.callUpdateNetworkStatisticsTimeout) { clearTimeout(this.callUpdateNetworkStatisticsTimeout); }
        this.callUpdateNetworkStatisticsTimeout = setTimeout(
            this.callUpdateNetworkStatistics,
            timeout * 1000,
        ) as unknown as NodeJS.Timer;
    }

    // Update operator statistics every 120 seconds
    private readonly callUpdateOperatorStatistics = async (props?: Props): Promise<void> => {
        props = props || this.props;

        const { web3, address, tokenPrices, darknodeList, darknodeRegisteringList, renNetwork } = props.store;
        let timeout = 1; // Retry in a second, unless the call succeeds
        if (address && tokenPrices) {
            try {
                let list = darknodeRegisteringList.keySeq().toList();
                if (darknodeList) {
                    list = list.concat(darknodeList);
                }
                // tslint:disable-next-line: await-promise
                await props.actions.updateOperatorStatistics(web3, renNetwork, address, tokenPrices, list);
                timeout = 120;
            } catch (error) {
                _captureBackgroundException_(error, {
                    description: "Error thrown in callUpdateOperatorStatistics background task",
                });
                timeout = 10;
            }
        }
        if (this.callUpdateOperatorStatisticsTimeout) { clearTimeout(this.callUpdateOperatorStatisticsTimeout); }
        this.callUpdateOperatorStatisticsTimeout = setTimeout(
            this.callUpdateOperatorStatistics,
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
                await props.actions.updateDarknodeStatistics(
                    web3,
                    renNetwork,
                    darknodeID,
                    tokenPrices,
                );
                timeout = 30;
            } catch (error) {
                _captureBackgroundException_(error, {
                    description: "Error thrown in callUpdateSelectedDarknode background task",
                });
                timeout = 15; // try again in half the time
            }
        }
        if (this.callUpdateSelectedDarknodeTimeout) { clearTimeout(this.callUpdateSelectedDarknodeTimeout); }
        this.callUpdateSelectedDarknodeTimeout = setTimeout(
            this.callUpdateSelectedDarknode,
            timeout * 1000,
        ) as unknown as NodeJS.Timer;
    }

    // tslint:disable-next-line:member-ordering
    public setupLoops(): void {
        this.callUpdatePrices().catch(error => {
            _captureBackgroundException_(error, {
                description: "Error in callUpdatePrices in BackgroundTasks",
            });
        });
        this.callUpdateNetworkStatistics().catch(error => {
            _captureBackgroundException_(error, {
                description: "Error in callUpdateNetworkStatistics in BackgroundTasks",
            });
        });
        this.callUpdateSelectedDarknode().catch(error => {
            _captureBackgroundException_(error, {
                description: "Error in callUpdateSelectedDarknode in BackgroundTasks",
            });
        });
    }

    // tslint:disable-next-line:member-ordering
    public setupLoopsWithAccount(): void {
        this.callLookForLogout().catch(error => {
            _captureBackgroundException_(error, {
                description: "Error in callLookForLogout in BackgroundTasks",
            });
        });
        this.callUpdateOperatorStatistics().catch(error => {
            _captureBackgroundException_(error, {
                description: "Error in callUpdateOperatorStatistics in BackgroundTasks",
            });
        });
    }

}

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        address: state.trader.address,
        web3: state.trader.web3,
        tokenPrices: state.statistics.tokenPrices,
        darknodeList: state.trader.address ? state.statistics.darknodeList.get(state.trader.address, null) : null,
        darknodeRegisteringList: state.statistics.darknodeRegisteringList,
        renNetwork: state.trader.renNetwork,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        login,
        lookForLogout,
        updateTokenPrices,
        updateNetworkStatistics,
        updateOperatorStatistics,
        updateDarknodeStatistics,
    }, dispatch),
});

interface Props extends
    ReturnType<typeof mapStateToProps>,
    ConnectedReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {
}

export const BackgroundTasks = connect(mapStateToProps, mapDispatchToProps)(withRouter(BackgroundTasksClass));
