// import "babel-polyfill";

import * as Sentry from "@sentry/browser";
import * as React from "react";
import * as ReactDOM from "react-dom";

import Web3 from "web3";

import { NetworkData } from "@renex/renex";
import { Provider } from "react-redux";
import { Route, Router } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { HttpProvider } from "web3/providers";

import { App } from "./components/App";
import { ETH_NETWORK, ETH_NETWORK_LABEL, NETWORK, SENTRY_DSN } from "./environmentVariables";
import { history } from "./lib/history";
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
                <App />
            </Router>
        </PersistGate>
    </Provider>,
    document.getElementById("root") as HTMLElement
);
