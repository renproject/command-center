import { showReportDialog } from "@sentry/browser";
import React from "react";

import { classNames } from "../../lib/react/className";
import { catchComponentException } from "../../lib/react/errors";

interface Props
    extends React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    > {
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

const defaultState = {
    // Entries must be immutable
    error: null as null | Error,
    errorInfo: null as null | React.ErrorInfo,
};

export class ErrorBoundary extends React.Component<Props, typeof defaultState> {
    constructor(props: Props) {
        super(props);
        this.state = defaultState;
    }

    public componentDidCatch = (error: Error, errorInfo: React.ErrorInfo) => {
        this.setState({
            error,
            errorInfo,
        });
        catchComponentException(error, errorInfo);
    };

    public onClose = () => {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
        this.setState({
            error: null,
            errorInfo: null,
        });
    };

    /**
     * The main render function.
     * @dev Should have minimal computation, loops and anonymous functions.
     */
    public render() {
        const {
            children,
            popup,
            onCancel,
            className,
            defaultValue,
            ...props
        } = this.props;

        if (this.state.errorInfo) {
            // Error path
            return (
                <div
                    defaultValue={defaultValue as string[]}
                    {...props}
                    className={classNames(
                        this.props.popup ? "popup" : "error-boundary--standard",
                        "error-boundary",
                        className,
                    )}
                >
                    <div className="error-boundary--header">
                        <h2>Something went wrong.</h2>
                        {!popup ? (
                            <button
                                className="error-boundary--feedback"
                                onClick={showReportDialog}
                            >
                                Report feedback
                            </button>
                        ) : null}
                    </div>
                    <details style={{ whiteSpace: "pre-wrap" }}>
                        <summary>
                            <span className="summary-title">Error details</span>
                        </summary>
                        <div className="summary-content">
                            Error details
                            {this.state.error && String(this.state.error)}
                            <br />
                            {this.state.errorInfo.componentStack}
                        </div>
                    </details>
                    {popup ? (
                        <div className="popup--buttons">
                            <button onClick={this.onClose}>Close</button>
                            <button
                                className="error-boundary--feedback"
                                onClick={showReportDialog}
                            >
                                Report feedback
                            </button>
                        </div>
                    ) : null}
                </div>
            );
        }
        // Normally, just render children
        return children;
    }
}
