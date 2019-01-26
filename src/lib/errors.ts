// tslint:disable: no-any

import * as Sentry from "@sentry/browser";

import { NETWORK } from "../environmentVariables";

interface Details {
    description?: string;
    category?: string;
    level?: Sentry.Severity;
}

interface Described {
    description: string;
}

interface ShownToUser {
    shownToUser: string;
}

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
                    // If this value does not reference a parent it can be deduped
                    return JSON.parse(JSON.stringify(value));
                } catch (error) {
                    // discard key if value cannot be deduped
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

const _captureException_ = <X extends Details>(error: any, details: X) => {
    Sentry.withScope(scope => {
        // Category
        if (details.category) {
            scope.setTag("category", details.category);
        }

        // Level
        if (details.level) {
            scope.setLevel(details.level);
        }

        // Extra information
        Object.keys(details)
            .forEach(key => {
                scope.setExtra(key, details[key]);
            });

        // If there's a server response, log it
        if (error && error.response && error.response.data) {
            scope.setExtra("serverResponse", error.response.data);
        }

        scope.setExtra("caught", true);
        scope.setExtra("zRawError", rawError(error));

        console.error(error);

        let environment = (process.env.NODE_ENV === "development") ? "local" : NETWORK;
        if (environment !== "mainnet") {
            environment = (environment || "").toUpperCase();
            if (typeof error === "string") {
                // tslint:disable-next-line: no-parameter-reassignment
                error = `[${environment}] ${error}`;
            } else {
                try {
                    error.message = `[${environment}] ${error.message || error}`;
                } catch {
                    // Ignore: Unable to overwrite message (may be read-only)
                }
            }
        }

        Sentry.captureException(error);
    });
};

// Background exceptions are thrown in background loops and actions
export const _captureBackgroundException_ = <X extends Details & Described>(error: any, details?: X) => {
    _captureException_(error, { ...details, category: "background_exception" });
};

// Interaction exceptions are thrown as a direct result of a user interaction
export const _captureInteractionException_ = <X extends Details & Described & ShownToUser>(error: any, details?: X) => {
    _captureException_(error, { ...details, category: "interaction_exception" });
};

// Component exceptions are thrown from an ErrorBoundary
export const _captureComponentException_ = (error: any, errorInfo: React.ErrorInfo) => {
    _captureException_(error, { ...errorInfo, description: "Error caught in Error Boundary. See Component stack trace.", category: "component_exception" });
};

// _noCapture_ is to mark errors that should not be reported to Sentry.
export const _noCapture_ = (error: Error): Error => {
    (error as any)._noCapture_ = true;
    return error;
};
