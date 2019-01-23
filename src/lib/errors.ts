// tslint:disable: no-any

import * as Sentry from "@sentry/browser";

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

        scope.setExtra("uncaught", false);

        console.error(error);
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
