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

import { App } from "@Components/App";
import { history } from "@Library/history";
import { configureStore } from "@Store/configureStore";

import "@Root/index.css";

export const { store, persistor } = configureStore();

interface EthereumProvider extends HttpProvider {
    enable(): Promise<void>;
}

declare global {
    interface Window {
        web3: Web3 | undefined;
        ethereum: EthereumProvider | undefined;
        API: string;
        NETWORK: NetworkData;
        INFURA_KEY: string;
        SENTRY_DSN: string;
    }
}

// Initialize Sentry error logging
Sentry.init({
    dsn: window.SENTRY_DSN,
    environment: (process.env.NODE_ENV === "development") ? "local" : window.NETWORK.network,
});

ReactDOM.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <Router history={history}>
                <>
                    <Route path="/" exact component={App} />
                    <Route path="/darknode/:darknodeID" exact component={App} />
                </>
            </Router>
        </PersistGate>
    </Provider>,
    document.getElementById("root") as HTMLElement
);
