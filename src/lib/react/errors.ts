/* eslint-disable @typescript-eslint/no-explicit-any */

import * as Sentry from "@sentry/browser";

import { RenNetwork } from "@renproject/contracts";
import { naturalTime } from "@renproject/react-components";

import { SECONDS } from "../../controllers/common/BackgroundTasks";
import {
    DEFAULT_REN_NETWORK,
    NODE_ENV,
    SENTRY_DSN,
} from "./environmentVariables";

interface Details {
    description: string;
    category?: string;
    level?: Sentry.Severity;
    ignoreNetwork?: boolean;
}

interface Described {
    description: string;
}

interface ShownToUser {
    shownToUser?: string;
}

let pageLoaded: Date;
export const pageLoadedAt = (): string => {
    if (!pageLoaded) {
        pageLoaded = new Date();
        return pageLoaded.toUTCString();
    } else {
        return naturalTime(Math.floor(pageLoaded.getTime() / SECONDS), {
            message: "Just now",
            suffix: "ago",
            countDown: false,
        });
    }
};

// Determines whether or not this is a common network error (too many of these
// are being logged to Sentry)
const isNetworkError = (error: Error | any): boolean => {
    const message: string = String((error || {}).message || error);

    if (
        /Network ?Error/i.exec(message) ||
        /Failed to fetch/i.exec(message) ||
        /Network request failed/i.exec(message) ||
        /Wrong response id/i.exec(message) ||
        /Request failed or timed out/i.exec(message) ||
        /Returned values aren't valid, did it run Out of Gas\?/i.exec(
            message,
        ) ||
        /Invalid JSON RPC response/i.exec(message) ||
        /timeout of 0ms exceeded/i.exec(message) ||
        /header not found/i.exec(message)
    ) {
        return true;
    }

    return false;
};

const rawError = (errorObject: Error) => {
    // https://stackoverflow.com/questions/11616630/json-stringify-avoid-typeerror-converting-circular-structure-to-json/11616993#11616993

    // Note: cache should not be re-used by repeated calls to JSON.stringify.
    let cache: any[] | null = [];
    const rawErrorJSON = JSON.stringify(errorObject, (key, value) => {
        if (key === "request") {
            return "... omitted";
        }
        if (cache && typeof value === "object" && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Duplicate reference found
                try {
                    // If this value does not reference a parent it can be
                    // de-duped
                    return JSON.parse(JSON.stringify(value));
                } catch (error) {
                    // discard key if value cannot be de-duped
                    return;
                }
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
    cache = null; // Enable garbage collection

    return rawErrorJSON;
};

const catchException = <X extends Details>(error: any, details: X) => {
    console.error(error);

    if (error._noCapture_ || !SENTRY_DSN) {
        return;
    }

    try {
        Sentry.withScope((scope) => {
            // How long ago the page was loaded at
            scope.setExtra("pageLoadedAt", pageLoadedAt());

            // Category
            if (details.category) {
                scope.setTag("category", details.category);
            }

            // Level
            if (details.level) {
                scope.setLevel(details.level);
            }

            // Extra information
            Object.keys(details).forEach((key) => {
                scope.setExtra(key, details[key]);
            });

            if (error && error.response) {
                scope.setExtra("responseData", error.response.data);
                scope.setExtra("responseStatus", error.response.status);
            }

            scope.setExtra("caught", true);
            scope.setExtra("zRawError", rawError(error));

            if (DEFAULT_REN_NETWORK !== RenNetwork.Mainnet) {
                if (typeof error === "string") {
                    error = `[${DEFAULT_REN_NETWORK}-${NODE_ENV}] ${error}`;
                } else {
                    try {
                        error.message = `[${DEFAULT_REN_NETWORK}-${NODE_ENV}] ${String(
                            error.message || error,
                        )}`;
                    } catch {
                        // Ignore: Unable to overwrite message (may be read-only)
                    }
                }
            }

            // Check if we should ignore the error
            if (details.ignoreNetwork && isNetworkError(error)) {
                return;
            }

            Sentry.captureException(error);
        });
    } catch (sentryError) {
        // Ignore sentry error.
    }
};

// export const ignoreException = <X extends Details & Described>(error: any, details?: X | string) => {
//     console.error(error, details);
// };

// Background exceptions are thrown in background loops and actions
export const catchBackgroundException = <X extends Details & Described>(
    error: any,
    details: X | string,
) => {
    catchException(error, {
        ignoreNetwork: true,
        ...(typeof details === "string" ? { description: details } : details),
        category: "background_exception",
    });
};

// Interaction exceptions are thrown as a direct result of a user interaction
export const catchInteractionException = <
    X extends Details & Described & ShownToUser,
>(
    error: any,
    details: X | string,
) => {
    catchException(error, {
        ...(typeof details === "string" ? { description: details } : details),
        category: "interaction_exception",
    });
};

// Component exceptions are thrown from an ErrorBoundary
export const catchComponentException = (
    error: any,
    errorInfo: React.ErrorInfo,
) => {
    catchException(error, {
        ...errorInfo,
        description:
            "Error caught in Error Boundary. See Component stack trace.",
        category: "component_exception",
    });
};

// _noCapture_ is to mark errors that should not be reported to Sentry.
export const noCapture = (error: Error): Error => {
    (error as any)._noCapture_ = true;
    return error;
};

// export class LocalError extends Error {
//     public _noCapture_ = true;
// }

export const extractError = (error: any): string => {
    if (typeof error === "object") {
        if (error.response) {
            return extractError(error.response);
        }
        if (error.data) {
            return extractError(error.data);
        }
        if (error.error) {
            return extractError(error.error);
        }
        if (error.message) {
            return extractError(error.message);
        }
        if (error.statusText) {
            return extractError(error.statusText);
        }
        try {
            return JSON.stringify(error);
        } catch (_error) {
            // Ignore JSON error
        }
    }
    return String(error);
};
