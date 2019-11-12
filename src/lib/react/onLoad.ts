import * as Sentry from "@sentry/browser";

import { ExtraErrorData } from "@sentry/integrations";
import Web3 from "web3";
import { HttpProvider } from "web3-providers";

import { DEFAULT_REN_NETWORK, NODE_ENV, SENTRY_DSN, SOURCE_VERSION } from "./environmentVariables";
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

/**
 *  onLoad runs setup tasks when the page is loaded
 *
 * @param title The HTML title to show
 */
export const onLoad = (title: string) => {

    // Initialize Sentry error logging
    Sentry.init({
        // Used to define the project to log errors to
        dsn: SENTRY_DSN,

        // Used to separate testnet and mainnet errors
        environment: `${DEFAULT_REN_NETWORK}-${NODE_ENV}`,

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

        integrations: [new ExtraErrorData()],
    });

    Sentry.configureScope((scope) => {
        scope.setExtra("loggedIn", false);

        // We set this to false when logging to Sentry explicitly.
        scope.setExtra("caught", false);

        scope.setExtra("release", SOURCE_VERSION);

        scope.setExtra("pageLoadedAt", pageLoadedAt());
    });

    // Update document title
    document.title = title; // Also set in index.html

    // tslint:disable-next-line: no-console
    console.debug(`${title} version hash: ${SOURCE_VERSION}`);
};
