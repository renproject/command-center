import * as Sentry from "@sentry/browser";

import Web3 from "web3";

import { HttpProvider } from "web3-providers";

import { _catch_ } from "../components/ErrorBoundary";
import { environment, NETWORK, Network, SENTRY_DSN, SOURCE_VERSION } from "./environmentVariables";
import { pageLoadedAt } from "./errors";

interface EthereumProvider extends HttpProvider {
    enable(): Promise<void>;
}

declare global {
    interface Window {
        web3: Web3 | undefined;
        ethereum: EthereumProvider | undefined;
    }
}

export const onLoad = (title: string) => {

    // Initialize Sentry error logging
    Sentry.init({
        // Used to define the project to log errors to
        dsn: SENTRY_DSN,

        // Used to separate testnet and mainnet errors
        environment,

        // Used to track errors across versions
        release: SOURCE_VERSION,

        // Only throw errors generated from scripts at these URLs
        whitelistUrls: [
            /.*republicprotocol.*/i,
            /.*renproject.*/i,

            // Local testing (localhost and IPv4 addresses)
            /.*localhost.*/i,
            /.*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).*/
        ],
    });

    Sentry.configureScope((scope) => {
        scope.setExtra("loggedIn", false);

        // We set this to false when logging to Sentry explicitly.
        scope.setExtra("caught", false);

        scope.setExtra("release", SOURCE_VERSION);

        scope.setExtra("pageLoadedAt", pageLoadedAt());
    });

    // Update document title to show network
    if (NETWORK !== Network.Mainnet) {
        document.title = `${title} (${NETWORK})`;
    } else {
        document.title = title; // Also set in index.html
    }

    // tslint:disable-next-line: no-console
    console.log(`${title} version hash: ${SOURCE_VERSION}`);
};
