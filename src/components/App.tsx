import * as Sentry from "@sentry/browser";
import * as React from "react";

import { connect } from "react-redux";
import { Route, RouteComponentProps, withRouter } from "react-router-dom";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import { Alerts } from "./Alerts";
import { Home } from "./pages/Home";
import { LoggingOut } from "./pages/LoggingOut";
import { PopupController } from "./popups/PopupController";

import { updateNetworkStatistics, updateTokenPrices } from "../actions/statistics/networkActions";
import { updateDarknodeStatistics, updateOperatorStatistics } from "../actions/statistics/operatorActions";
import { login, lookForLogout } from "../actions/trader/accountActions";
import { ApplicationData } from "../reducers/types";
import { Darknode } from "./pages/Darknode";
import { LoggingIn } from "./pages/LoggingIn";
import { Sidebar } from "./Sidebar";

interface AppProps extends
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {
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
    private callUpdateSelectedDarknodeTimeout: NodeJS.Timer | undefined;

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

        // Sometimes, logging in seems to freeze, to we start loops that don't
        // rely on being logged in before attempting to log in
        this.setupLoops();

        try {
            await this.props.actions.login(sdk, { redirect: false, showPopup: !darknodeID, immediatePopup: false });
        } catch (err) {
            console.error(err);
            Sentry.captureException(err);
        }

        this.setupLoopsWithAccount();
    }

    public componentWillReceiveProps = (nextProps: AppProps) => {
        if (this.props.store.address !== nextProps.store.address) {
            this.callUpdateOperatorStatistics(nextProps).catch(console.error);
        }

        const { match: { params: nextParams } } = nextProps;
        const { match: { params } } = this.props;
        const { darknodeID: nextDarknodeID } = nextParams as { darknodeID: string };
        const { darknodeID } = params as { darknodeID: string };
        if (darknodeID !== nextDarknodeID) {
            this.callUpdateSelectedDarknode(nextProps).catch(console.error);
        }

    }

    public componentWillUnmount() {
        // Clear timeouts
        if (this.callUpdatePricesTimeout) { clearTimeout(this.callUpdatePricesTimeout); }
        if (this.callLookForLogoutTimeout) { clearTimeout(this.callLookForLogoutTimeout); }
        if (this.callUpdateNetworkStatisticsTimeout) { clearTimeout(this.callUpdateNetworkStatisticsTimeout); }
        if (this.callUpdateOperatorStatisticsTimeout) { clearTimeout(this.callUpdateOperatorStatisticsTimeout); }
        if (this.callUpdateSelectedDarknodeTimeout) { clearTimeout(this.callUpdateSelectedDarknodeTimeout); }
    }

    public withAccount = <T extends React.ComponentClass>(component: T):
        React.ComponentClass | React.StatelessComponent =>
        this.props.store.address ? component : LoggingIn

    public render(): JSX.Element {
        const { match: { params } } = this.props;
        const { address, sdk } = this.props.store;
        let { darknodeID } = params as { darknodeID: string };
        darknodeID = darknodeID && sdk.getWeb3().utils.toChecksumAddress(darknodeID.toLowerCase());

        // We set the key to be the address so that any sub-component state is reset after changing accounts (e.g. if in
        // the middle of a transaction, etc.)
        return <div className="app" key={address || undefined}>
            <ScrollToTop />
            <PopupController>
                {address ? <Sidebar selectedDarknode={darknodeID} /> : null}
                <Route path="/" exact component={this.withAccount(Home)} />
                <Route path="/darknode/:darknodeID" exact component={Darknode} />
                <Route path="/loading" component={LoggingOut} />
                <Alerts />
            </PopupController>
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
        this.callUpdatePricesTimeout = setTimeout(this.callUpdatePrices, 60 * 1000) as unknown as NodeJS.Timer;
    }

    // See if the user has logged out every 5 seconds
    private callLookForLogout = async (props?: AppProps) => {
        props = props || this.props;

        const { sdk, address, readOnlyProvider } = props.store;
        if (address) {
            try {
                await props.actions.lookForLogout(sdk, address, readOnlyProvider);
            } catch (err) {
                console.error(err);
            }
        }
        if (this.callLookForLogoutTimeout) { clearTimeout(this.callLookForLogoutTimeout); }
        this.callLookForLogoutTimeout = setTimeout(this.callLookForLogout, 5 * 1000) as unknown as NodeJS.Timer;
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
        this.callUpdateNetworkStatisticsTimeout = setTimeout(
            this.callUpdateNetworkStatistics,
            timeout * 1000,
        ) as unknown as NodeJS.Timer;
    }

    // Update operator statistics every 120 seconds
    private callUpdateOperatorStatistics = async (props?: AppProps) => {
        props = props || this.props;

        const { sdk, address, tokenPrices, darknodeList } = props.store;
        let timeout = 1;
        if (address && tokenPrices) {
            try {
                await props.actions.updateOperatorStatistics(sdk, address, tokenPrices, darknodeList);
                timeout = 120;
            } catch (err) {
                console.error(err);
                timeout = 120 / 2;
            }
        }
        if (this.callUpdateOperatorStatisticsTimeout) { clearTimeout(this.callUpdateOperatorStatisticsTimeout); }
        this.callUpdateOperatorStatisticsTimeout = setTimeout(
            this.callUpdateOperatorStatistics,
            timeout * 1000,
        ) as unknown as NodeJS.Timer;
    }

    // Update selected darknode statistics every 30 seconds
    private callUpdateSelectedDarknode = async (props?: AppProps) => {
        props = props || this.props;

        const { match: { params } } = props;
        const { sdk, tokenPrices } = props.store;

        let { darknodeID } = params as { darknodeID: string };
        darknodeID = darknodeID && sdk.getWeb3().utils.toChecksumAddress(darknodeID.toLowerCase());

        let timeout = 1; // if the action isn't called, try again in 1 second
        if (tokenPrices && darknodeID) {
            try {
                await props.actions.updateDarknodeStatistics(sdk, darknodeID, tokenPrices);
                timeout = 30;
            } catch (err) {
                console.error(err);
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
    public setupLoops() {
        this.callUpdatePrices().catch(console.error);
        this.callUpdateNetworkStatistics().catch(console.error);
        this.callUpdateSelectedDarknode().catch(console.error);
    }

    // tslint:disable-next-line:member-ordering
    public setupLoopsWithAccount() {
        this.callLookForLogout().catch(console.error);
        this.callUpdateOperatorStatistics().catch(console.error);
    }

}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        address: state.trader.address,
        sdk: state.trader.sdk,
        readOnlyProvider: state.trader.readOnlyProvider,
        tokenPrices: state.statistics.tokenPrices,
        darknodeList: state.trader.address ? state.statistics.darknodeList.get(state.trader.address, null) : null,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        login,
        lookForLogout,
        updateTokenPrices,
        updateNetworkStatistics,
        updateOperatorStatistics,
        updateDarknodeStatistics,
    }, dispatch),
});

export const App = connect(mapStateToProps, mapDispatchToProps)(withRouter(AppClass));
