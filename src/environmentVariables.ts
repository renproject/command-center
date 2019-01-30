
const infuraURL = process.env.REACT_APP_INFURA_URL || "";
const infix = infuraURL[infuraURL.length - 1] === "/" ? "" : "/";

export const INFURA_URL = `${infuraURL}${infix}${process.env.REACT_APP_INFURA_KEY}`;
export const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN;
export const NETWORK = process.env.REACT_APP_NETWORK;
export const ETH_NETWORK = process.env.REACT_APP_ETH_NETWORK;
export const ETH_NETWORK_LABEL = process.env.REACT_APP_ETH_NETWORK_LABEL;
export const COMMIT = process.env.REACT_APP_REACT_APP_COMMIT;
export const COMMIT_DESCRIPTION = process.env.REACT_APP_REACT_APP_COMMIT_DESCRIPTION;
export const APP_NAME = process.env.REACT_APP_REACT_APP_APP_NAME;
export const RELEASE_VERSION = process.env.REACT_APP_REACT_APP_RELEASE_VERSION;

console.log(process.env.REACT_APP_HEROKU_SLUG_COMMIT);
console.log(process.env.REACT_APP_SOURCE_VERSION);
console.log(COMMIT);
console.log(COMMIT_DESCRIPTION);
console.log(APP_NAME);
console.log(RELEASE_VERSION);

export const environment = ((process.env.NODE_ENV === "development") ? "local" : NETWORK) || "unknown";
