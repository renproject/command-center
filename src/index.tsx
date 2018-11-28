import "babel-polyfill";

import * as Sentry from "@sentry/browser";
import * as React from "react";
import * as ReactDOM from "react-dom";

import Web3 from "web3";
import { HttpProvider } from "web3/types";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { NetworkData } from "renex-sdk-ts";

import App from "@Components/App";
import configureStore from "@Store/configureStore";

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
            <App />
        </PersistGate>
    </Provider>,
    document.getElementById("root") as HTMLElement
);
