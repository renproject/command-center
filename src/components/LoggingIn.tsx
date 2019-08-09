import * as React from "react";

import { EmptyDarknodeList } from "./allDarknodesPage/darknodeList/EmptyDarknodeList";

/**
 * LoggingIn is a page whose principal components are wallet selection to allow users
 * to log-in, and the hidden orderbook
 */
export const LoggingIn: React.StatelessComponent = () =>
    <div className="logging-in">
        <EmptyDarknodeList />
    </div>;
