import * as Sentry from "@sentry/browser";
import * as React from "react";

import { connect } from "react-redux";
import { HashRouter, Redirect, Route, RouteComponentProps, withRouter } from "react-router-dom";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import { Alerts } from "@Components/Alerts";
import { Home } from "@Components/pages/Home";
import { LoggingOut } from "@Components/pages/LoggingOut";
import { Popup } from "@Components/popups/Popup";

import { updateTokenPrices } from "@Actions/statistics/networkActions";
import { updateAllDarknodeStatistics, updateOperatorStatistics } from "@Actions/statistics/operatorActions";
import { login, lookForLogout } from "@Actions/trader/accountActions";
import { ApplicationData } from "@Reducers/types";

interface AppProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
}

interface AppState {
    checkingReLogin: boolean;
}

// Scroll restoration based on https://reacttraining.com/react-router/web/guides/scroll-restoration
const ScrollToTop = withRouter(
    // tslint:disable-next-line:no-any
    class ScrollToTopWithoutRouter extends React.Component<RouteComponentProps<any>> {
        // tslint:disable-next-line:no-any
        public componentDidUpdate(prevProps: Readonly<RouteComponentProps<any>>): void {
            if (this.props.location !== prevProps.location) {
                window.scrollTo(0, 0);
            }
        }

        public render(): JSX.Element | null {
            return null;
        }
    }
);

/**
 * App is the main visual component responsible for displaying different routes
 * and running background app loops
 */
class AppClass extends React.Component<AppProps, AppState> {
    private callUpdatePricesTimeout: NodeJS.Timer | undefined;
    private callLookForLogoutTimeout: NodeJS.Timer | undefined;
    private callUpdateOperatorStatisticsTimeout: NodeJS.Timer | undefined;
    private callUpdateDarknodeStatisticsTimeout: NodeJS.Timer | undefined;

    public constructor(props: AppProps, context: object) {
        super(props, context);
        this.state = {
            checkingReLogin: false,
        };
    }

    public async componentDidMount(): Promise<void> {
        // Check if user was logged-in already
        this.setState({ checkingReLogin: true });
        try {
            await this.props.actions.login({ redirect: false });
        } catch (err) {
            console.error(err);
            Sentry.captureException(err);
        }
        this.setState({ checkingReLogin: false });

        this.setupLoops();
    }

    public componentWillUnmount() {
        // Clear timeouts
        if (this.callUpdatePricesTimeout) { clearTimeout(this.callUpdatePricesTimeout); }
        if (this.callLookForLogoutTimeout) { clearTimeout(this.callLookForLogoutTimeout); }
        if (this.callUpdateOperatorStatisticsTimeout) { clearTimeout(this.callUpdateOperatorStatisticsTimeout); }
        if (this.callUpdateDarknodeStatisticsTimeout) { clearTimeout(this.callUpdateDarknodeStatisticsTimeout); }
    }

    public setupLoops() {
        // See if the user has logged out every 5 seconds
        const callUpdatePrices = async () => {
            try {
                await this.props.actions.updateTokenPrices();
            } catch (err) {
                console.error(err);
            }
            if (this.callUpdatePricesTimeout) { clearTimeout(this.callUpdatePricesTimeout); }
            this.callUpdatePricesTimeout = setTimeout(callUpdatePrices, 60 * 1000);
        };
        callUpdatePrices().catch(console.error);

        // See if the user has logged out every 5 seconds
        const callLookForLogout = async () => {
            const { sdk } = this.props.store;
            if (sdk) {
                try {
                    await this.props.actions.lookForLogout(sdk);
                } catch (err) {
                    console.error(err);
                }
            }
            if (this.callLookForLogoutTimeout) { clearTimeout(this.callLookForLogoutTimeout); }
            this.callLookForLogoutTimeout = setTimeout(callLookForLogout, 5 * 1000);
        };
        callLookForLogout().catch(console.error);

        // Update operator statistics every 60 seconds
        const callUpdateOperatorStatistics = async () => {
            const { sdk } = this.props.store;
            let timeout = 1;
            if (sdk) {
                try {
                    await this.props.actions.updateOperatorStatistics(sdk);
                    timeout = 60;
                } catch (err) {
                    console.error(err);
                    timeout = 30;
                }
            }
            if (this.callUpdateOperatorStatisticsTimeout) { clearTimeout(this.callUpdateOperatorStatisticsTimeout); }
            this.callUpdateOperatorStatisticsTimeout = setTimeout(callUpdateOperatorStatistics, timeout * 1000);
        };
        callUpdateOperatorStatistics().catch(console.error);

        // Update darknode statistics every 120 seconds
        const callUpdateDarknodeStatistics = async () => {
            const { sdk, tokenPrices, darknodeList } = this.props.store;
            let timeout = 1;
            console.log("!!!");
            console.log(sdk && true);
            console.log(tokenPrices && true);
            console.log(darknodeList && true);
            if (sdk && tokenPrices && darknodeList) {
                try {
                    await this.props.actions.updateAllDarknodeStatistics(sdk, darknodeList, tokenPrices);
                    timeout = 120;
                } catch (err) {
                    console.error(err);
                    timeout = 60;
                }
            }
            if (this.callUpdateDarknodeStatisticsTimeout) { clearTimeout(this.callUpdateDarknodeStatisticsTimeout); }
            this.callUpdateDarknodeStatisticsTimeout = setTimeout(callUpdateDarknodeStatistics, timeout * 1000);
        };
        callUpdateDarknodeStatistics().catch(console.error);
    }

    public withAccount<T extends React.ComponentClass>(component: T): React.ComponentClass | React.StatelessComponent {
        const { address } = this.props.store;
        const { checkingReLogin } = this.state;

        // show a loading spinner if retrieving the web3 instance is taking a
        // while (for example, when requesting MetaMask access)
        if (checkingReLogin) {
            return () => <LoggingOut />;
        }

        if (!address) {
            return () => <Redirect to="/" />;
        }
        return component;
    }

    public render(): JSX.Element {
        return (
            <HashRouter>
                {/* history={history}>*/}
                <div className="app">
                    <ScrollToTop />
                    <Route path="/" exact component={Home} />
                    <Route path="/loading" component={LoggingOut} />
                    <Alerts />
                    <Popup />
                </div>
            </HashRouter>
        );
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        address: state.trader.address,
        pendingAlerts: state.alert.pendingAlerts,
        sdk: state.trader.sdk,
        wallet: state.trader.wallet,
        tokenPrices: state.statistics.tokenPrices,
        darknodeList: state.statistics.darknodeList,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        login,
        lookForLogout,
        updateOperatorStatistics,
        updateTokenPrices,
        updateAllDarknodeStatistics,
    }, dispatch),
});

export const App = connect(mapStateToProps, mapDispatchToProps)(AppClass);
