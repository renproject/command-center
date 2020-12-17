// import { NODE_ENV } from "./environmentVariables";

// For local testing, allow swapping between valid and invalid keys:

const pick = <T>(array: T[]): T =>
    array[Math.floor(Math.random() * array.length)];

export const loadKey = (key: string | undefined): string =>
    key ? pick(key.split(",")) : "";
