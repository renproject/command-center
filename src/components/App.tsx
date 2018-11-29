import * as React from "react";

import Web3 from "web3";

import { connect } from "react-redux";
import { Redirect, Route, RouteComponentProps, Router, withRouter } from "react-router-dom";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import RenExSDK from "renex-sdk-ts";

import Alerts from "@Components/Alerts";
import Exchange from "@Components/pages/Home";
import LoggingOut from "@Components/pages/LoggingOut";
import Home from "@Components/pages/Login";
import Popup from "@Components/popups/Popup";
import history from "@Library/history";

import { clearPopup, ClearPopupAction, setPopup, SetPopupAction } from "@Actions/popup/popupActions";
import { updateNetworkStatistics, UpdateNetworkStatisticsAction } from "@Actions/statistics/network";
import { login, LoginAction, logout, LogoutAction, lookForLogout, LookForLogoutAction } from "@Actions/trader/accountActions";
import { Wallet } from "@Library/wallets/wallet";
import { getInjectedWeb3Provider } from "@Library/wallets/web3browser";
import { includesAddress } from "@Library/web3";
import { AlertData, ApplicationData } from "@Reducers/types";

interface StoreProps {
    address: string | null;
    pendingAlerts: AlertData["pendingAlerts"];
    sdk: RenExSDK;
    wallet: Wallet | null;
}

interface AppProps extends StoreProps {
    actions: {
        clearPopup: ClearPopupAction;
        login: LoginAction;
        logout: LogoutAction;
        lookForLogout: LookForLogoutAction;
        setPopup: SetPopupAction;
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
    private setupLoopsTimeout: NodeJS.Timer | undefined;
    private callLookForLogoutTimeout: NodeJS.Timer | undefined;
    private callUpdateNetworkStatisticsTimeout: NodeJS.Timer | undefined;

    public constructor(props: AppProps, context: object) {
        super(props, context);
        this.state = {
            checkingReLogin: false,
        };
    }

    public async componentDidMount(): Promise<void> {
        const { sdk } = this.props;

        // Check if user was logged-in already
        this.setState({ checkingReLogin: true });
        const loggedIn = await this.handleReLogin();
        if (!loggedIn) {
            this.props.actions.logout(sdk, { reload: false });
        }
        this.setState({ checkingReLogin: false });

        this.setupLoops();
    }

    public componentWillUnmount() {
        // Clear timeouts
        if (this.setupLoopsTimeout) { clearTimeout(this.setupLoopsTimeout); }
        if (this.callLookForLogoutTimeout) { clearTimeout(this.callLookForLogoutTimeout); }
        if (this.callUpdateNetworkStatisticsTimeout) { clearTimeout(this.callUpdateNetworkStatisticsTimeout); }
    }

    public setupLoops() {
        // See if the user has logged out every 5 seconds
        const callLookForLogout = async () => {
            const { sdk, wallet } = this.props;
            if (sdk.address() && wallet === Wallet.MetaMask) {
                try {
                    await this.props.actions.lookForLogout(sdk);
                } catch (err) {
                    console.error(err);
                }
            }
            this.callLookForLogoutTimeout = setTimeout(callLookForLogout, 5 * 1000);
        };
        callLookForLogout().catch(console.error);

        // Update network statistics every 30 seconds
        const callUpdateNetworkStatistics = async () => {
            const { sdk } = this.props;
            try {
                await this.props.actions.updateNetworkStatistics(sdk);
            } catch (err) {
                console.error(err);
            }
            this.callUpdateNetworkStatisticsTimeout = setTimeout(callUpdateNetworkStatistics, 30 * 1000);
        };
        callUpdateNetworkStatistics().catch(console.error);
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
            <Router history={history}>
                <div className="app">
                    <ScrollToTop />
                    <Route path="/" exact component={Home} />
                    <Route path="/home" component={this.withAccount(Exchange)} />
                    <Route path="/loading" component={LoggingOut} />
                    <Alerts />
                    <Popup />
                </div>
            </Router>
        );
    }

    private async handleReLogin(): Promise<boolean> {
        const { address, actions, sdk } = this.props;
        if (address) {
            let provider;
            try {
                provider = await getInjectedWeb3Provider();
            } catch (error) {
                // Injected Web3 request was denied
                return false;
            }

            const included = await includesAddress(new Web3(provider), address);
            if (included) {
                // These are repeated in login, but the page will log-out if the
                // address is not available immediately
                sdk.updateProvider(provider);
                sdk.updateAddress(address);
                actions.login(sdk, provider, address, { redirect: false });
                return true;
            }
        }
        return false;
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
            updateNetworkStatistics,
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
