import React, { useCallback, useEffect } from "react";

import { catchBackgroundException } from "../../lib/react/errors";
import { Web3Container } from "../../store/web3Container";
import { EmptyDarknodeList } from "../operatorPages/allDarknodesPage/darknodeList/EmptyDarknodeList";

/**
 * LoggingIn is a page whose principal components are wallet selection to allow users
 * to log-in, and the hidden orderbook
 */
export const LoggingIn: React.FC<{}> = () => {
    const { address, promptLogin } = Web3Container.useContainer();

    const handleLogin = useCallback(async (): Promise<void> => {
        if (!address) {
            await promptLogin({ manual: false });
        }
    }, [promptLogin, address]);

    useEffect(() => {
        handleLogin().catch((error) =>
            catchBackgroundException(error, "Error in LoggingIn > handleLogin"),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="logging-in">
            <EmptyDarknodeList />
        </div>
    );
};
