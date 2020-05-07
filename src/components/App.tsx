import * as React from "react";

import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { FeedbackButton } from "@renproject/react-components";

import { DEFAULT_REN_NETWORK } from "../lib/react/environmentVariables";
import { catchBackgroundException } from "../lib/react/errors";
import { Web3Container } from "../store/web3Store";
import { AllDarknodes } from "./allDarknodesPage/AllDarknodes";
import { NotFound } from "./common/404";
import { BackgroundTasks } from "./common/BackgroundTasks";
import { _catch_ } from "./common/ErrorBoundary";
import { URLs } from "./common/ExternalLink";
import { Header } from "./common/Header";
import { LoggingIn } from "./common/LoggingIn";
import { PopupController } from "./common/popups/PopupController";
import { Sidebar } from "./common/sidebar/Sidebar";
import { Darknode, getDarknodeParam } from "./darknodePage/Darknode";
import { IntegratorsPage } from "./integratorsPage/IntegratorsPage";
import { Overview } from "./networkDarknodesPage/Overview";
import { NetworkStats } from "./networkStatsPage/NetworkStats";
import { RenVM } from "./renvmPage/RenVM";
import { ScrollToTop } from "./ScrollToTop";

interface Props extends
    RouteComponentProps {
}

/**
 * App is the main visual component responsible for displaying different routes
 * and running background app loops
 */
export const App = withRouter(({ match: { params } }: Props) => {
    const { web3, address, loggedInBefore, promptLogin, renNetwork, setWeb3, setRenNetwork: setNetwork } = Web3Container.useContainer();

    const withAccount = React.useCallback(<T extends React.ComponentClass | React.StatelessComponent>(component: T):
        React.ComponentClass | React.StatelessComponent =>
        address ? component : LoggingIn,
        [address],
    );

    React.useEffect(() => {
        setWeb3(web3);
        setNetwork(renNetwork);
    }, [web3]);

    const darknodeID = getDarknodeParam(params);
    const showNetworkBanner = renNetwork.name !== DEFAULT_REN_NETWORK;

    React.useEffect(() => {
        if (loggedInBefore && darknodeID) {
            promptLogin({ manual: false, redirect: false, showPopup: false, immediatePopup: false })
                .catch((error) => catchBackgroundException(error, "Error in App > promptLogin"));
        }
    }, []);

    return <div className="app">
        <BackgroundTasks />
        <ScrollToTop />
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
            <PopupController>
                {_catch_(<Sidebar selectedDarknode={darknodeID} />)}
                <div className="app--body">
                    {_catch_(<Switch>
                        {/* tslint:disable-next-line: react-this-binding-issue jsx-no-lambda */}
                        <Route path="/" exact component={NetworkStats} />
                        <Route path="/integrators" exact component={IntegratorsPage} />
                        <Route path="/integrators/:page" exact component={IntegratorsPage} />
                        <Route path="/darknode-stats" exact component={Overview} />
                        <Route path="/all" exact component={withAccount(AllDarknodes)} />
                        <Route path="/darknode/:darknodeID" exact component={Darknode} />

                        {/* Old hyperdrive URLs */}
                        <Route path="/hyperdrive" exact component={RenVM} />
                        <Route path="/hyperdrive/:blockNumber" exact component={RenVM} />

                        <Route path="/renvm" exact component={RenVM} />

                        {/* RenVM TX */}
                        <Route path="/tx/:txHash" exact component={RenVM} />
                        <Route path="/renvm/tx/:txHash" exact component={RenVM} />

                        {/* RenVM Block */}
                        <Route path="/block/:blockNumber" exact component={RenVM} />
                        <Route path="/renvm/:blockNumber" exact component={RenVM} />
                        <Route path="/renvm/block/:blockNumber" exact component={RenVM} />

                        {/* 404 */}
                        <Route component={NotFound} />
                    </Switch>, { popup: true })}
                    <FeedbackButton url={URLs.feedbackButton} />
                </div>
                {/* {_catch_(<Footer />)} */}
            </PopupController>
            {_catch_(<Header />)}
        </div>
    </div>;
});
