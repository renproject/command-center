import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";

import { DEFAULT_REN_NETWORK } from "../lib/environmentVariables";
import { ApplicationData } from "../store/types";
import { BackgroundTasks } from "./BackgroundTasks";
import { DarknodeMap } from "./darknodeMap/darknodeMap";
import { _catch_ } from "./ErrorBoundary";
import { Header } from "./Header";
import { Darknode, getDarknodeParam } from "./pages/Darknode";
import { Home } from "./pages/Home";
import { LoggingIn } from "./pages/LoggingIn";
import { NotFound } from "./pages/NotFound";
import { PopupController } from "./popups/PopupController";
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
class AppClass extends React.Component<Props> {
    public withAccount = <T extends React.ComponentClass>(component: T):
        React.ComponentClass | React.StatelessComponent =>
        this.props.store.address ? component : LoggingIn

    public render = (): JSX.Element => {
        const { match: { params }, store: { address, renNetwork } } = this.props;
        const darknodeID = getDarknodeParam(params);
        const showNetworkBanner = renNetwork.name !== DEFAULT_REN_NETWORK;

        return <div key={`${address || undefined} ${renNetwork}`} className="app">
            <BackgroundTasks />
            <ScrollToTop />
            {/*
              * We set the key to be the address so that any sub-component state is reset after changing accounts
              * (e.g. if in
              * the middle of a transaction, etc.)
              */}
            <div className={showNetworkBanner ? `with-banner with-banner--${renNetwork.chain}` : ""}>
                {showNetworkBanner ?
                    <div className="network--banner">Using <span className="banner--bold">{renNetwork.label}</span> RenVM network, <span className="banner--bold">{renNetwork.chainLabel}</span> Ethereum network</div> :
                    <></>
                }
                <PopupController>
                    {address ? _catch_(<Sidebar selectedDarknode={darknodeID} />) : null}
                    <div className="app--body">
                        <Switch>
                            <Route path="/" exact component={DarknodeMap} />
                            <Route path="/all" exact component={this.withAccount(Home)} />
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
        renNetwork: state.trader.renNetwork,
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

export const App = connect(mapStateToProps, mapDispatchToProps)(withRouter(AppClass));
