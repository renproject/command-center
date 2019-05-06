import { Network } from "../store/types";

export const PUBLIC_NODE = process.env.REACT_APP_PUBLIC_NODE;
export const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN;
export const DEPLOYMENT = process.env.REACT_APP_DEPLOYMENT as Network | undefined;
export const SOURCE_VERSION = process.env.REACT_APP_SOURCE_VERSION;
export const environment = ((process.env.NODE_ENV === "development") ? "local" : DEPLOYMENT) || "unknown";
