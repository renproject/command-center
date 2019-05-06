import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";

import { Home } from "./pages/Home";
import { PopupController } from "./popups/PopupController";

import { DEPLOYMENT } from "../lib/environmentVariables";
import { _captureBackgroundException_ } from "../lib/errors";
import { ApplicationData, EthNetwork, getNetworkLabel, Network } from "../store/types";
import { BackgroundTasks } from "./BackgroundTasks";
import { _catch_ } from "./ErrorBoundary";
import { Header } from "./Header";
import { Darknode, getDarknodeParam } from "./pages/Darknode";
import { LoggingIn } from "./pages/LoggingIn";
import { NotFound } from "./pages/NotFound";
import { Sidebar } from "./Sidebar";

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
class AppClass extends React.Component<Props, State> {
    public constructor(props: Props, context: object) {
        super(props, context);
        this.state = {
        };
    }

    public withAccount = <T extends React.ComponentClass>(component: T):
        React.ComponentClass | React.StatelessComponent =>
        this.props.store.address ? component : LoggingIn

    public render = (): JSX.Element => {
        const { match: { params }, store: { address, ethNetwork } } = this.props;
        const darknodeID = getDarknodeParam(params);
        console.log(DEPLOYMENT);
        const showNetworkBanner = ethNetwork !== EthNetwork.Mainnet || DEPLOYMENT === Network.Staging;

        return <div className="app">
            <BackgroundTasks />
            <ScrollToTop />
            {/*
              * We set the key to be the address so that any sub-component state is reset after changing accounts
              * (e.g. if in
              * the middle of a transaction, etc.)
              */}
            <div key={`${address || undefined} ${ethNetwork}`} className={showNetworkBanner ? `with-banner with-banner--${ethNetwork}` : ""}>
                {showNetworkBanner ?
                    <div className="network--banner">Using <span className="banner--bold">{getNetworkLabel(ethNetwork)}</span> Ethereum network</div> :
                    <></>
                }
                <PopupController>
                    {address ? _catch_(<Sidebar selectedDarknode={darknodeID} />) : null}
                    <div className="app--body">
                        <Switch>
                            <Route path="/" exact component={this.withAccount(Home)} />
                            <Route path="/darknode/:darknodeID" exact component={Darknode} />
                            <Route component={NotFound} />
                        </Switch>
                    </div>
                </PopupController>
                {_catch_(<Header />)}
            </div>
        </div>;
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        address: state.trader.address,
        web3: state.trader.web3,
        ethNetwork: state.trader.ethNetwork,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

interface Props extends
    ReturnType<typeof mapStateToProps>,
    ConnectedReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {
}

interface State {
}

export const App = connect(mapStateToProps, mapDispatchToProps)(withRouter(AppClass));
