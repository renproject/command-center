import { RenNetwork } from "@renproject/contracts";

import { loadKey } from "./isDev";

// Automatically set
export const NODE_ENV = process.env.NODE_ENV;
export const SOURCE_VERSION = process.env.REACT_APP_SOURCE_VERSION || "local";

// Set in .env / settings page
export const INFURA_KEY = loadKey(process.env.REACT_APP_INFURA_KEY);
export const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN || "";
export const DEFAULT_REN_NETWORK = process.env.REACT_APP_NETWORK
    ? (process.env.REACT_APP_NETWORK.toLowerCase() as RenNetwork)
    : RenNetwork.Testnet;
export const EXTRA_WALLETS_INFURA_KEY =
    process.env.REACT_APP_BLOCKNATIVE_INFURA_KEY || "";
export const BLOCKNATIVE_KEY = process.env.REACT_APP_BLOCKNATIVE_KEY || "";
export const PORTIS_KEY = process.env.REACT_APP_PORTIS_KEY || "";

export const DEFAULT_REQUEST_TIMEOUT = 60 * 1000;

export const MINIMUM_SHIFTED_AMOUNT = 0.0007;

// TODO: Once testnet dev tools are deployed, add link.
export const DEV_TOOLS = "https://renproject.github.io/dev-tools/#";