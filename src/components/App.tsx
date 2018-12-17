import * as Sentry from "@sentry/browser";
import * as React from "react";

import { connect } from "react-redux";
import { Route, RouteComponentProps, withRouter } from "react-router-dom";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import { Alerts } from "@Components/Alerts";
import { Home } from "@Components/pages/Home";
import { LoggingOut } from "@Components/pages/LoggingOut";
import { Popup } from "@Components/popups/Popup";

import { updateNetworkStatistics, updateTokenPrices } from "@Actions/statistics/networkActions";
import { updateAllDarknodeStatistics, updateDarknodeStatistics, updateOperatorStatistics } from "@Actions/statistics/operatorActions";
import { login, lookForLogout } from "@Actions/trader/accountActions";
import { ApplicationData } from "@Reducers/types";
import { Darknode } from "./pages/Darknode";
import { LoggingIn } from "./pages/LoggingIn";
import { Sidebar } from "./Sidebar";

interface AppProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps>, RouteComponentProps {
}

interface AppState {
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
    private callUpdateNetworkStatisticsTimeout: NodeJS.Timer | undefined;
    private callUpdateOperatorStatisticsTimeout: NodeJS.Timer | undefined;
    private callUpdateAllDarknodeStatisticsTimeout: NodeJS.Timer | undefined;
    private callUpdateSelectedDarknodeStatisticsTimeout: NodeJS.Timer | undefined;

    public constructor(props: AppProps, context: object) {
        super(props, context);
        this.state = {
        };
    }

    public componentDidMount = async () => {
        const { match: { params }, store } = this.props;
        const { sdk } = store;
        const { darknodeID } = params as { darknodeID: string };

        try {
            await this.props.actions.login(sdk, { redirect: false, showPopup: !darknodeID, immediatePopup: false });
        } catch (err) {
            console.error(err);
            Sentry.captureException(err);
        }

        this.setupLoops();
    }

    public componentWillUnmount() {
        // Clear timeouts
        if (this.callUpdatePricesTimeout) { clearTimeout(this.callUpdatePricesTimeout); }
        if (this.callLookForLogoutTimeout) { clearTimeout(this.callLookForLogoutTimeout); }
        if (this.callUpdateNetworkStatisticsTimeout) { clearTimeout(this.callUpdateNetworkStatisticsTimeout); }
        if (this.callUpdateOperatorStatisticsTimeout) { clearTimeout(this.callUpdateOperatorStatisticsTimeout); }
        if (this.callUpdateAllDarknodeStatisticsTimeout) { clearTimeout(this.callUpdateAllDarknodeStatisticsTimeout); }
        if (this.callUpdateSelectedDarknodeStatisticsTimeout) { clearTimeout(this.callUpdateSelectedDarknodeStatisticsTimeout); }
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
            const { sdk, address, readOnlyProvider } = this.props.store;
            if (address) {
                try {
                    await this.props.actions.lookForLogout(sdk, readOnlyProvider);
                } catch (err) {
                    console.error(err);
                }
            }
            if (this.callLookForLogoutTimeout) { clearTimeout(this.callLookForLogoutTimeout); }
            this.callLookForLogoutTimeout = setTimeout(callLookForLogout, 5 * 1000);
        };
        callLookForLogout().catch(console.error);

        // Update network statistics every 3600 seconds
        const callUpdateNetworkStatistics = async () => {
            const { sdk } = this.props.store;
            let timeout = 3600;
            try {
                await this.props.actions.updateNetworkStatistics(sdk);
            } catch (err) {
                console.error(err);
                timeout = 1; // Retry in a second if an error occurred
            }
            if (this.callUpdateNetworkStatisticsTimeout) { clearTimeout(this.callUpdateNetworkStatisticsTimeout); }
            this.callUpdateNetworkStatisticsTimeout = setTimeout(callUpdateNetworkStatistics, timeout * 1000);
        };
        callUpdateNetworkStatistics().catch(console.error);

        // Update operator statistics every 60 seconds
        const callUpdateOperatorStatistics = async () => {
            const { sdk, address } = this.props.store;
            let timeout = 1;
            if (address) {
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

        // Update all darknode statistics every 120 seconds
        const callUpdateAllDarknodeStatistics = async () => {
            const { store } = this.props;
            const { sdk, tokenPrices, darknodeList } = store;
            let timeout = 1; // if the action isn't called, try again in 1 second
            if (tokenPrices && darknodeList) {
                try {
                    await this.props.actions.updateAllDarknodeStatistics(sdk, darknodeList, tokenPrices);
                    timeout = 120;
                } catch (err) {
                    console.error(err);
                    timeout = 60;  // try again in half the time
                }
            }
            if (this.callUpdateAllDarknodeStatisticsTimeout) { clearTimeout(this.callUpdateAllDarknodeStatisticsTimeout); }
            this.callUpdateAllDarknodeStatisticsTimeout = setTimeout(callUpdateAllDarknodeStatistics, timeout * 1000);
        };
        callUpdateAllDarknodeStatistics().catch(console.error);

        // Update selected darknode statistics every 30 seconds
        const callUpdateSelectedDarknodeStatistics = async () => {
            const { match: { params }, store } = this.props;
            const { darknodeID } = params as { darknodeID: string };

            const { sdk, tokenPrices } = store;
            let timeout = 1; // if the action isn't called, try again in 1 second
            if (tokenPrices && darknodeID) {
                try {
                    await this.props.actions.updateDarknodeStatistics(sdk, darknodeID, tokenPrices);
                    timeout = 30;
                } catch (err) {
                    console.error(err);
                    timeout = 15; // try again in half the time
                }
            }
            if (this.callUpdateSelectedDarknodeStatisticsTimeout) { clearTimeout(this.callUpdateSelectedDarknodeStatisticsTimeout); }
            this.callUpdateSelectedDarknodeStatisticsTimeout = setTimeout(callUpdateSelectedDarknodeStatistics, timeout * 1000);
        };
        callUpdateSelectedDarknodeStatistics().catch(console.error);
    }

    public withAccount = <T extends React.ComponentClass>(component: T): React.ComponentClass | React.StatelessComponent =>
        this.props.store.address ? component : LoggingIn

    public render(): JSX.Element {
        const { match: { params }, store } = this.props;
        const { address } = store;
        const { darknodeID } = params as { darknodeID: string };

        return <div className="app">
            <ScrollToTop />
            {address ? <Sidebar selectedDarknode={darknodeID} /> : null}
            <Route path="/" exact component={this.withAccount(Home)} />
            <Route path="/darknode/:darknodeID" exact component={Darknode} />
            <Route path="/loading" component={LoggingOut} />
            <Alerts />
            <Popup />
        </div>;
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        address: state.trader.address,
        sdk: state.trader.sdk,
        readOnlyProvider: state.trader.readOnlyProvider,
        tokenPrices: state.statistics.tokenPrices,
        darknodeList: state.statistics.darknodeList,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        login,
        lookForLogout,
        updateTokenPrices,
        updateNetworkStatistics,
        updateOperatorStatistics,
        updateAllDarknodeStatistics,
        updateDarknodeStatistics,
    }, dispatch),
});

export const App = connect(mapStateToProps, mapDispatchToProps)(withRouter(AppClass));
