import * as Sentry from "@sentry/browser";
import * as React from "react";

import { _captureComponentException_ } from "../lib/errors";

const defaultState = {
    error: null as null | Error,
    errorInfo: null as null | React.ErrorInfo,
};

class ErrorBoundary extends React.Component<Props, typeof defaultState> {
    constructor(props: Props) {
        super(props);
        this.state = defaultState;
    }

    public componentDidCatch = (error: Error, errorInfo: React.ErrorInfo) => {
        this.setState({
            error,
            errorInfo,
        });
        _captureComponentException_(error, errorInfo);
    }

    /**
     * The main render function.
     * @dev Should have minimal computation, loops and anonymous functions.
     */
    public render(): React.ReactNode {
        if (this.state.errorInfo) {
            // Error path
            return (
                <div className={this.props.popup ? "popup" : ""}>
                    <h2>Something went wrong.</h2>
                    <details style={{ whiteSpace: "pre-wrap" }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo.componentStack}
                    </details>
                    {this.props.popup ? <div className="popup--buttons">
                        <button onClick={this.reportFeedback}>Report feedback</button>
                        <button onClick={this.props.onCancel}>Close</button>
                    </div> : null
                    }
                </div>
            );
        }
        // Normally, just render children
        return this.props.children;
    }

    private readonly reportFeedback = () => {
        Sentry.showReportDialog();
    }
}

interface Props {
    /**
     * Popup specifies whether or not the Error Boundary is being rendered in
     * the popup controller.
     */
    popup?: boolean;

    /**
     * If `popup` is true, then onCancel should also be provided.
     */
    onCancel?(): void;
}

export const _catch_ = (
    children: React.ReactNode,
    options?: { key?: string; popup?: boolean; onCancel?(): void }
) => <ErrorBoundary key={options && options.key} popup={options && options.popup} onCancel={options && options.onCancel}>
        {children}
    </ErrorBoundary>;
