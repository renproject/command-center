import * as React from "react";

import { FeedbackButton } from "@renproject/react-components";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";

import { DEFAULT_REN_NETWORK } from "../lib/react/environmentVariables";
import { catchBackgroundException } from "../lib/react/errors";
import { Web3Container } from "../store/web3Store";
import { NotFound } from "../views/404";
import { URLs } from "../views/ExternalLink";
import { BackgroundTasks } from "./common/BackgroundTasks";
import { _catch_ } from "./common/ErrorBoundary";
import { Header } from "./common/header/Header";
import { LoggingIn } from "./common/LoggingIn";
import { PopupController } from "./common/popups/PopupController";
import { Sidebar } from "./common/sidebar/Sidebar";
import { AllDarknodes } from "./operatorPages/allDarknodesPage/AllDarknodes";
import { DarknodePage, getDarknodeParam } from "./operatorPages/darknodePage/DarknodePage";
import { ScrollToTop } from "./ScrollToTop";
import { DarknodeStatsPage } from "./statsPages/darknodeStatsPage/DarknodeStatsPage";
import { IntegratorStatsPage } from "./statsPages/integratorStatsPage/IntegratorStatsPage";
import { NetworkStats } from "./statsPages/networkStatsPage/NetworkStats";
import { RenVMStatsPage } from "./statsPages/renvmStatsPage/RenVMStatsPage";

/**
 * App is the main visual component responsible for displaying different routes
 * and running background app loops
 */
export const App = withRouter(({ match: { params } }: RouteComponentProps) => {
    const { address, loggedInBefore, promptLogin, renNetwork } = Web3Container.useContainer();

    const withAccount = React.useCallback(<T extends React.ComponentClass | React.StatelessComponent>(component: T):
        React.ComponentClass | React.StatelessComponent =>
        address ? component : LoggingIn,
        [address],
    );

    const darknodeID = getDarknodeParam(params);
    const showNetworkBanner = renNetwork.name !== DEFAULT_REN_NETWORK;

    React.useEffect(() => {
        if (loggedInBefore) { // && darknodeID) {
            promptLogin({ manual: false })
                .catch((error) => catchBackgroundException(error, "Error in App > promptLogin"));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div className="app">
        <BackgroundTasks />
        <ScrollToTop />
        <div className={[address ? "with-account" : "without-account", showNetworkBanner ? `with-banner with-banner--${renNetwork.chain}` : ""].join(" ")}>
            {showNetworkBanner ?
                <div className="network--banner">Using <span className="banner--bold">{renNetwork.label}</span> RenVM network, <span className="banner--bold">{renNetwork.chainLabel}</span> Ethereum network</div> :
                <></>
            }
            <PopupController>
                {_catch_(<Sidebar selectedDarknode={darknodeID} />)}
                <div className="app--body">
                    {_catch_(<Switch>
                        <Route path="/" exact component={NetworkStats} />
                        <Route path="/network" exact component={NetworkStats} />
                        <Route path="/integrators" exact component={IntegratorStatsPage} />
                        <Route path="/integrators/:page" exact component={IntegratorStatsPage} />
                        <Route path="/darknode-stats" exact component={DarknodeStatsPage} />
                        <Route path="/darknodes" exact component={DarknodeStatsPage} />
                        <Route path="/all" exact component={withAccount(AllDarknodes)} />
                        <Route path="/darknode/:darknodeID" exact component={DarknodePage} />

                        {/* Old hyperdrive URLs */}
                        <Route path="/hyperdrive" exact component={RenVMStatsPage} />
                        <Route path="/hyperdrive/:blockNumber" exact component={RenVMStatsPage} />

                        <Route path="/renvm" exact component={RenVMStatsPage} />

                        {/* RenVM TX */}
                        <Route path="/tx/:txHash" exact component={RenVMStatsPage} />
                        <Route path="/renvm/tx/:txHash" exact component={RenVMStatsPage} />

                        {/* RenVM Block */}
                        <Route path="/block/:blockNumber" exact component={RenVMStatsPage} />
                        <Route path="/renvm/:blockNumber" exact component={RenVMStatsPage} />
                        <Route path="/renvm/block/:blockNumber" exact component={RenVMStatsPage} />

                        {/* 404 */}
                        <Route component={NotFound} />
                    </Switch>, { popup: true })}
                    <FeedbackButton url={URLs.feedbackButton} />
                </div>
            </PopupController>
            {_catch_(<Header />)}
        </div>
    </div>;
});
