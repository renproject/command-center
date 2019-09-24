import * as Sentry from "@sentry/browser";
import * as React from "react";

import { _captureComponentException_ } from "../../lib/react/errors";

const defaultState = { // Entries must be immutable
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
        _captureComponentException_(error, errorInfo);
    }

    public onClose = () => {
        if (this.props.onCancel) { this.props.onCancel(); }
        this.setState({
            error: null,
            errorInfo: null,
        });
    }

    /**
     * The main render function.
     * @dev Should have minimal computation, loops and anonymous functions.
     */
    public render(): React.ReactNode {
        const { children, popup, onCancel, className, ...props } = this.props;

        if (this.state.errorInfo) {
            // Error path
            return (
                <div {...props} className={[this.props.popup ? "popup" : "error-boundary--standard", "error-boundary", className].join(" ")}>
                    <div className="error-boundary--header">
                        <h2>Something went wrong.</h2>
                        {!popup ? <button className="error-boundary--feedback" onClick={this.reportFeedback}>Report feedback</button> : <></>}
                    </div>
                    <details style={{ whiteSpace: "pre-wrap" }}>
                        <summary>
                            <span className="summary-title">Error details</span>
                        </summary>
                        <div className="summary-content">Error details
                            {this.state.error && this.state.error.toString()}
                            <br />
                            {this.state.errorInfo.componentStack}
                        </div>
                    </details>
                    {popup ? <div className="popup--buttons">
                        <button onClick={this.onClose}>Close</button>
                        <button className="error-boundary--feedback" onClick={this.reportFeedback}>Report feedback</button>
                    </div> : null
                    }
                </div>
            );
        }
        // Normally, just render children
        return children;
    }

    private readonly reportFeedback = () => {
        Sentry.showReportDialog();
    }
}

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
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
) => <ErrorBoundary key={options && options.key} popup={options && options.popup} onCancel={options && options.onCancel} >
        {children}
    </ErrorBoundary>;
