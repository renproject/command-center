// import "babel-polyfill";

import * as Sentry from "@sentry/browser";
import * as React from "react";
import * as ReactDOM from "react-dom";

import Web3 from "web3";

import { Provider } from "react-redux";
import { Route, Router, Switch } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { HttpProvider } from "web3/providers";

import { App } from "./components/App";
import { ETH_NETWORK, ETH_NETWORK_LABEL, NETWORK, SENTRY_DSN } from "./environmentVariables";
import { history } from "./history";
import { configureStore } from "./store/configureStore";

import "./index.scss";

export const { store, persistor } = configureStore();

interface EthereumProvider extends HttpProvider {
    enable(): Promise<void>;
}

declare global {
    interface Window {
        web3: Web3 | undefined;
        ethereum: EthereumProvider | undefined;
    }
}

// Initialize Sentry error logging
Sentry.init({
    dsn: SENTRY_DSN,
    environment: (process.env.NODE_ENV === "development") ? "local" : NETWORK,
});

// Update document title to show network
if (ETH_NETWORK !== "main") {
    document.title = "DCC (" + ETH_NETWORK_LABEL + ")";
}

ReactDOM.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <Router history={history}>
                <Switch>
                    {/* We add the routes here as well as in App so that App has access to the URL parameters */}
                    <Route path="/darknode/:darknodeID" exact component={App} />
                    <Route component={App} />
                </Switch>
            </Router>
        </PersistGate>
    </Provider>,
    document.getElementById("root") as HTMLElement
);
