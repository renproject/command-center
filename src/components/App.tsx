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
        const { match: { params } } = this.props;
        const { sdk } = this.props.store;
        let { darknodeID } = params as { darknodeID: string };
        darknodeID = darknodeID && sdk.getWeb3().utils.toChecksumAddress(darknodeID.toLowerCase());

        try {
            await this.props.actions.login(sdk, { redirect: false, showPopup: !darknodeID, immediatePopup: false });
        } catch (err) {
            console.error(err);
            Sentry.captureException(err);
        }

        this.setupLoops();
    }

    public componentWillReceiveProps = (nextProps: AppProps) => {
        if (this.props.store.address !== nextProps.store.address) {
            this.callUpdateOperatorStatistics(nextProps).catch(console.error);
            this.callUpdateAllDarknodeStatistics(nextProps).catch(console.error);
        }


        const { match: { params: nextParams } } = nextProps;
        const { match: { params } } = this.props;
        const { darknodeID: nextDarknodeID } = nextParams as { darknodeID: string };
        const { darknodeID } = params as { darknodeID: string };
        if (darknodeID !== nextDarknodeID) {
            this.callUpdateSelectedDarknodeStatistics(nextProps).catch(console.error);
        }

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

    public withAccount = <T extends React.ComponentClass>(component: T): React.ComponentClass | React.StatelessComponent =>
        this.props.store.address ? component : LoggingIn

    public render(): JSX.Element {
        const { match: { params } } = this.props;
        const { address, sdk } = this.props.store;
        let { darknodeID } = params as { darknodeID: string };
        darknodeID = darknodeID && sdk.getWeb3().utils.toChecksumAddress(darknodeID.toLowerCase());

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


    // Update token prices every 60 seconds
    private callUpdatePrices = async (props?: AppProps) => {
        props = props || this.props;

        try {
            await props.actions.updateTokenPrices();
        } catch (err) {
            console.error(err);
        }
        if (this.callUpdatePricesTimeout) { clearTimeout(this.callUpdatePricesTimeout); }
        this.callUpdatePricesTimeout = setTimeout(this.callUpdatePrices, 60 * 1000);
    }

    // See if the user has logged out every 5 seconds
    private callLookForLogout = async (props?: AppProps) => {
        props = props || this.props;

        const { sdk, address, readOnlyProvider } = props.store;
        if (address) {
            try {
                await props.actions.lookForLogout(sdk, readOnlyProvider);
            } catch (err) {
                console.error(err);
            }
        }
        if (this.callLookForLogoutTimeout) { clearTimeout(this.callLookForLogoutTimeout); }
        this.callLookForLogoutTimeout = setTimeout(this.callLookForLogout, 5 * 1000);
    }

    // Update network statistics every 3600 seconds
    private callUpdateNetworkStatistics = async (props?: AppProps) => {
        props = props || this.props;

        const { sdk } = props.store;
        let timeout = 3600;
        try {
            await props.actions.updateNetworkStatistics(sdk);
        } catch (err) {
            console.error(err);
            timeout = 1; // Retry in a second if an error occurred
        }
        if (this.callUpdateNetworkStatisticsTimeout) { clearTimeout(this.callUpdateNetworkStatisticsTimeout); }
        this.callUpdateNetworkStatisticsTimeout = setTimeout(this.callUpdateNetworkStatistics, timeout * 1000);
    }

    // Update operator statistics every 60 seconds
    private callUpdateOperatorStatistics = async (props?: AppProps) => {
        props = props || this.props;

        const { sdk, address } = props.store;
        let timeout = 1;
        if (address) {
            try {
                await props.actions.updateOperatorStatistics(sdk);
                timeout = 60;
            } catch (err) {
                console.error(err);
                timeout = 30;
            }
        }
        if (this.callUpdateOperatorStatisticsTimeout) { clearTimeout(this.callUpdateOperatorStatisticsTimeout); }
        this.callUpdateOperatorStatisticsTimeout = setTimeout(this.callUpdateOperatorStatistics, timeout * 1000);
    }

    // Update selected darknode statistics every 30 seconds
    private callUpdateSelectedDarknodeStatistics = async (props?: AppProps) => {
        props = props || this.props;

        const { match: { params } } = props;
        const { sdk, tokenPrices, darknodeDetails } = props.store;

        let { darknodeID } = params as { darknodeID: string };
        darknodeID = darknodeID && sdk.getWeb3().utils.toChecksumAddress(darknodeID.toLowerCase());

        let timeout = 1; // if the action isn't called, try again in 1 second
        if (tokenPrices && darknodeID) {
            try {
                const previousDetails = darknodeDetails.get(darknodeID);
                await props.actions.updateDarknodeStatistics(sdk, darknodeID, tokenPrices, previousDetails);
                timeout = 30;
            } catch (err) {
                console.error(err);
                timeout = 15; // try again in half the time
            }
        }
        if (this.callUpdateSelectedDarknodeStatisticsTimeout) { clearTimeout(this.callUpdateSelectedDarknodeStatisticsTimeout); }
        this.callUpdateSelectedDarknodeStatisticsTimeout = setTimeout(this.callUpdateSelectedDarknodeStatistics, timeout * 1000);
    }

    // Update all darknode statistics every 120 seconds
    private callUpdateAllDarknodeStatistics = async (props?: AppProps) => {
        props = props || this.props;

        const { store } = props;
        const { sdk, tokenPrices, darknodeList, darknodeDetails } = store;
        let timeout = 1; // if the action isn't called, try again in 1 second
        if (tokenPrices && darknodeList) {
            try {
                await props.actions.updateAllDarknodeStatistics(sdk, darknodeList, tokenPrices, darknodeDetails);
                timeout = 120;
            } catch (err) {
                console.error(err);
                timeout = 60;  // try again in half the time
            }
        }
        if (this.callUpdateAllDarknodeStatisticsTimeout) { clearTimeout(this.callUpdateAllDarknodeStatisticsTimeout); }
        this.callUpdateAllDarknodeStatisticsTimeout = setTimeout(this.callUpdateAllDarknodeStatistics, timeout * 1000);
    }

    // tslint:disable-next-line:member-ordering
    public setupLoops() {
        this.callUpdatePrices().catch(console.error);
        this.callLookForLogout().catch(console.error);
        this.callUpdateNetworkStatistics().catch(console.error);
        this.callUpdateOperatorStatistics().catch(console.error);
        this.callUpdateSelectedDarknodeStatistics().catch(console.error);
        this.callUpdateAllDarknodeStatistics().catch(console.error);

    }

}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        address: state.trader.address,
        sdk: state.trader.sdk,
        readOnlyProvider: state.trader.readOnlyProvider,
        tokenPrices: state.statistics.tokenPrices,
        darknodeList: state.statistics.darknodeList,
        darknodeDetails: state.statistics.darknodeDetails,
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
