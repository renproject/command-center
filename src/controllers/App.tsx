import { FeedbackButton } from "@renproject/react-components";
import React, { useCallback, useEffect } from "react";
import { Route, Switch } from "react-router-dom";

import { classNames } from "../lib/react/className";
import { catchBackgroundException } from "../lib/react/errors";
import { Web3Container } from "../store/web3Container";
import { NotFound } from "../views/404";
import { Catalog } from "../views/Catalog";
import { URLs } from "../views/ExternalLink";
import { BackgroundTasks } from "./common/BackgroundTasks";
import { ErrorBoundary } from "./common/ErrorBoundary";
import { Header } from "./common/header/Header";
import { LoggingIn } from "./common/LoggingIn";
import { PopupController } from "./common/popups/PopupController";
import { Sidebar } from "./common/sidebar/Sidebar";
import { DarknodePage } from "./pages/darknodePage/DarknodePage";
import { DarknodeStatsPage } from "./pages/darknodeStatsPage/DarknodeStatsPage";
import { IntegratorStatsPage } from "./pages/integratorStatsPage/IntegratorStatsPage";
import { NetworkStatsPage } from "./pages/networkStatsPage/NetworkStatsPage";
import { AllDarknodes } from "./pages/operatorPage/AllDarknodes";
import { RenVMStatsPage } from "./pages/renvmStatsPage/RenVMStatsPage";
import { ScrollToTop } from "./ScrollToTop";

/**
 * App is the main visual component responsible for displaying different routes
 * and running background app loops.
 */
export const App = () => {
    const {
        address,
        loggedInBefore,
        promptLogin,
    } = Web3Container.useContainer();

    const withAccount = useCallback(
        <T extends React.ComponentClass | React.StatelessComponent>(
            component: T,
        ) => (address ? component : LoggingIn),
        [address],
    );

    useEffect(() => {
        if (loggedInBefore) {
            promptLogin({ manual: false }).catch((error) =>
                catchBackgroundException(error, "Error in App > promptLogin"),
            );
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="app">
            <BackgroundTasks />
            <ScrollToTop />
            <div
                className={classNames(
                    address ? "with-account" : "without-account",
                )}
            >
                <PopupController>
                    <ErrorBoundary>
                        <Sidebar />
                    </ErrorBoundary>
                    <div className="app--body">
                        <ErrorBoundary popup={true}>
                            <Switch>
                                {/* Stats pages */}
                                <Route
                                    path="/"
                                    exact
                                    component={NetworkStatsPage}
                                />
                                <Route
                                    path="/network"
                                    exact
                                    component={NetworkStatsPage}
                                />
                                <Route
                                    path="/integrators"
                                    exact
                                    component={IntegratorStatsPage}
                                />
                                <Route
                                    path="/integrators/:page"
                                    exact
                                    component={IntegratorStatsPage}
                                />
                                <Route
                                    path="/darknode-stats"
                                    exact
                                    component={DarknodeStatsPage}
                                />
                                <Route
                                    path="/darknodes"
                                    exact
                                    component={DarknodeStatsPage}
                                />
                                <Route
                                    path="/renvm"
                                    exact
                                    component={RenVMStatsPage}
                                />

                                {/* Operator pages */}
                                <Route
                                    path="/all"
                                    exact
                                    component={withAccount(AllDarknodes)}
                                />
                                <Route
                                    path="/darknode/:darknodeID"
                                    exact
                                    component={DarknodePage}
                                />

                                {/* RenVM TX */}
                                <Route
                                    path="/tx/:txHash"
                                    exact
                                    component={RenVMStatsPage}
                                />
                                <Route
                                    path="/renvm/tx/:txHash"
                                    exact
                                    component={RenVMStatsPage}
                                />

                                {/* RenVM Block */}
                                <Route
                                    path="/block/:blockNumber"
                                    exact
                                    component={RenVMStatsPage}
                                />
                                <Route
                                    path="/renvm/:blockNumber"
                                    exact
                                    component={RenVMStatsPage}
                                />
                                <Route
                                    path="/renvm/block/:blockNumber"
                                    exact
                                    component={RenVMStatsPage}
                                />

                                {/* Developer catalog */}
                                <Route path="/catalog" component={Catalog} />

                                {/* 404 - must be last route */}
                                <Route component={NotFound} />
                            </Switch>
                        </ErrorBoundary>
                        <FeedbackButton url={URLs.feedbackButton} />
                    </div>
                </PopupController>
                <ErrorBoundary>
                    <Header />
                </ErrorBoundary>
            </div>
        </div>
    );
};
