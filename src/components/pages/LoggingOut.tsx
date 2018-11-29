import * as React from "react";

import Loading from "@Components/Loading";

interface LoggingOutProps {
}

interface LoggingOutState {
}

/**
 * LoggingOut is a page which shows a single loading spinner. This page is
 * displayed while the page is being refreshed on log-out.
 */
class LoggingOut extends React.Component<LoggingOutProps, LoggingOutState> {
    public render(): JSX.Element {
        return (
            <div className="logging-out">
                <Loading alt />
            </div>
        );
    }
}

export default LoggingOut;
