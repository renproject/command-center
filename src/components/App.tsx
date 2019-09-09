import * as React from "react";

import { ScrollToTop } from "@renproject/react-components";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";

import { DEFAULT_REN_NETWORK } from "../lib/react/environmentVariables";
import { ApplicationState } from "../store/applicationState";
import { AppDispatch } from "../store/rootReducer";
import { AllDarknodes } from "./allDarknodesPage/AllDarknodes";
import { NotFound } from "./common/404";
import { BackgroundTasks } from "./common/BackgroundTasks";
import { Connect } from "./common/Connect";
import { _catch_ } from "./common/ErrorBoundary";
import { Footer } from "./common/Footer";
import { Header } from "./common/Header";
import { LoggingIn } from "./common/LoggingIn";
import { PopupController } from "./common/popups/PopupController";
import { Sidebar } from "./common/sidebar/Sidebar";
import { Darknode, getDarknodeParam } from "./darknodePage/Darknode";
import { Hyperdrive } from "./hyperdrivePage/Hyperdrive";
import { Overview } from "./overviewPage/Overview";

const ScrollToTopWithRouter = withRouter(ScrollToTop);

/**
 * App is the main visual component responsible for displaying different routes
 * and running background app loops
 */
const AppClass = ({ match: { params }, store: { address, renNetwork } }: Props) => {
    const withAccount = React.useCallback(<T extends React.ComponentClass>(component: T):
        React.ComponentClass | React.StatelessComponent =>
        address ? component : LoggingIn,
        [address],
    );

    const darknodeID = getDarknodeParam(params);
    const showNetworkBanner = renNetwork.name !== DEFAULT_REN_NETWORK;

    return <div className="app">
        <BackgroundTasks key={`${address || undefined} ${renNetwork.name}`} />
        <ScrollToTopWithRouter />
        {/*
            * We set the key to be the address so that any sub-component state is reset after changing accounts
            * (e.g. if in
            * the middle of a transaction, etc.)
            */}
        <div className={[address ? "with-account" : "without-account", showNetworkBanner ? `with-banner with-banner--${renNetwork.chain}` : ""].join(" ")}>
            {showNetworkBanner ?
                <div className="network--banner">Using <span className="banner--bold">{renNetwork.label}</span> RenVM network, <span className="banner--bold">{renNetwork.chainLabel}</span> Ethereum network</div> :
                <></>
            }
            <Connect>
                <PopupController>
                    {_catch_(<Sidebar selectedDarknode={darknodeID} />)}
                    <div className="app--body">
                        <Switch>
                            {/* tslint:disable-next-line: react-this-binding-issue jsx-no-lambda */}
                            <Route path="/" exact component={Overview} />
                            <Route path="/all" exact component={withAccount(AllDarknodes)} />
                            <Route path="/hyperdrive" exact component={Hyperdrive} />
                            <Route path="/hyperdrive/:blockNumber" exact component={Hyperdrive} />
                            <Route path="/darknode/:darknodeID" exact component={Darknode} />
                            <Route component={NotFound} />
                        </Switch>
                    </div>
                    {_catch_(<Footer />)}
                </PopupController>
            </Connect>
            {_catch_(<Header />)}
        </div>
    </div>;
};

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        address: state.account.address,
        web3: state.account.web3,
        renNetwork: state.account.renNetwork,
        tokenPrices: state.network.tokenPrices,
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
