import { RenNetwork } from "@renproject/contracts";

// Automatically set
export const NODE_ENV = process.env.NODE_ENV;
export const SOURCE_VERSION = process.env.REACT_APP_SOURCE_VERSION || "local";

// Set in .env / settings page
export const INFURA_KEY = process.env.REACT_APP_INFURA_KEY || "";
export const PUBLIC_NODE = process.env.REACT_APP_PUBLIC_NODE || "";
export const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN || "";
export const DEFAULT_REN_NETWORK = (process.env.REACT_APP_NETWORK as RenNetwork) || RenNetwork.Testnet;
