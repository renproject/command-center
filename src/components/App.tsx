import * as Sentry from "@sentry/browser";
import * as React from "react";

import { connect } from "react-redux";
import { HashRouter, Redirect, Route, RouteComponentProps, withRouter } from "react-router-dom";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import RenExSDK from "@renex/renex";

import Alerts from "@Components/Alerts";
import Exchange from "@Components/pages/Home";
import Home from "@Components/pages/Home";
import LoggingOut from "@Components/pages/LoggingOut";
import Popup from "@Components/popups/Popup";

import { clearPopup, ClearPopupAction, setPopup, SetPopupAction } from "@Actions/popup/popupActions";
import { updateNetworkStatistics, UpdateNetworkStatisticsAction } from "@Actions/statistics/networkActions";
import { updateOperatorStatistics, UpdateOperatorStatisticsAction } from "@Actions/statistics/operatorActions";
import { login, LoginAction, logout, LogoutAction, lookForLogout, LookForLogoutAction, storeSDK, StoreSDKAction } from "@Actions/trader/accountActions";
import { Wallet } from "@Library/wallets/wallet";
import { AlertData, ApplicationData } from "@Reducers/types";

interface StoreProps {
    address: string | null;
    pendingAlerts: AlertData["pendingAlerts"];
    sdk: RenExSDK | null;
    wallet: Wallet | null;
}

interface AppProps extends StoreProps {
    actions: {
        clearPopup: ClearPopupAction;
        login: LoginAction;
        logout: LogoutAction;
        lookForLogout: LookForLogoutAction;
        setPopup: SetPopupAction;
        storeSDK: StoreSDKAction;
        updateOperatorStatistics: UpdateOperatorStatisticsAction;
        updateNetworkStatistics: UpdateNetworkStatisticsAction;
    };
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
class App extends React.Component<AppProps, AppState> {
    private callLookForLogoutTimeout: NodeJS.Timer | undefined;
    private callUpdateOperatorStatisticsTimeout: NodeJS.Timer | undefined;

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
        if (this.callLookForLogoutTimeout) { clearTimeout(this.callLookForLogoutTimeout); }
        if (this.callUpdateOperatorStatisticsTimeout) { clearTimeout(this.callUpdateOperatorStatisticsTimeout); }
    }

    public setupLoops() {
        // See if the user has logged out every 5 seconds
        const callLookForLogout = async () => {
            const { sdk } = this.props;
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
            const { sdk } = this.props;
            let timeout = 1;
            if (sdk) {
                try {
                    await this.props.actions.updateOperatorStatistics(sdk);
                } catch (err) {
                    console.error(err);
                }
                timeout = 60;
            }
            if (this.callUpdateOperatorStatisticsTimeout) { clearTimeout(this.callUpdateOperatorStatisticsTimeout); }
            this.callUpdateOperatorStatisticsTimeout = setTimeout(callUpdateOperatorStatistics, timeout * 1000);
        };
        callUpdateOperatorStatistics().catch(console.error);
    }

    public withAccount<T extends React.ComponentClass>(component: T): React.ComponentClass | React.StatelessComponent {
        const { address } = this.props;
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
                    <Route path="/home" component={this.withAccount(Exchange)} />
                    <Route path="/loading" component={LoggingOut} />
                    <Alerts />
                    <Popup />
                </div>
            </HashRouter>
        );
    }
}

function mapStateToProps(state: ApplicationData): StoreProps {
    return {
        address: state.trader.address,
        pendingAlerts: state.alert.pendingAlerts,
        sdk: state.trader.sdk,
        wallet: state.trader.wallet,
    };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: AppProps["actions"] } {
    return {
        actions: bindActionCreators({
            clearPopup,
            login,
            logout,
            lookForLogout,
            setPopup,
            storeSDK,
            updateOperatorStatistics,
            updateNetworkStatistics,
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
