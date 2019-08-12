import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";

import { DEFAULT_REN_NETWORK } from "../lib/react/environmentVariables";
import { ApplicationState } from "../store/applicationState";
import { AppDispatch } from "../store/rootReducer";
import { NotFound } from "./404";
import { AllDarknodes } from "./allDarknodesPage/AllDarknodes";
import { BackgroundTasks } from "./common/BackgroundTasks";
import { Connect } from "./common/Connect";
import { _catch_ } from "./common/ErrorBoundary";
import { Header } from "./common/Header";
import { PopupController } from "./common/popups/PopupController";
import { Sidebar } from "./common/sidebar/Sidebar";
import { Darknode, getDarknodeParam } from "./darknodePage/Darknode";
import { Hyperdrive } from "./hyperdrivePage/Hyperdrive";
import { LoggingIn } from "./LoggingIn";
import { Overview } from "./overviewPage/Overview";

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

        return <div className="app">
            <BackgroundTasks key={`${address || undefined} ${renNetwork.name}`} />
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
                <Connect>
                    <PopupController>
                        {address ? _catch_(<Sidebar selectedDarknode={darknodeID} />) : null}
                        <div className="app--body">
                            <Switch>
                                {/* tslint:disable-next-line: react-this-binding-issue jsx-no-lambda */}

                                <Route path="/" exact component={Overview} />
                                <Route path="/all" exact component={this.withAccount(AllDarknodes)} />
                                <Route path="/hyperdrive" exact component={Hyperdrive} />
                                <Route path="/hyperdrive/:blockNumber" exact component={Hyperdrive} />
                                <Route path="/darknode/:darknodeID" exact component={Darknode} />
                                <Route component={NotFound} />
                            </Switch>
                        </div>
                    </PopupController>
                </Connect>
                {_catch_(<Header />)}
            </div>
        </div>;
    }
}

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        address: state.account.address,
        web3: state.account.web3,
        renNetwork: state.account.renNetwork,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

interface Props extends
    ReturnType<typeof mapStateToProps>,
    ConnectedReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {
}

export const App = connect(mapStateToProps, mapDispatchToProps)(withRouter(AppClass));
