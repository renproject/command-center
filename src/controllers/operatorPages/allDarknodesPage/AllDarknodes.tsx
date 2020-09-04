import React, { useMemo } from "react";

import { NetworkContainer } from "../../../store/networkContainer";
import { Web3Container } from "../../../store/web3Container";
import { ErrorBoundary } from "../../common/ErrorBoundary";
import { DarknodeList } from "./darknodeList/DarknodeList";

/**
 * Home is a page whose principal components are wallet selection to allow users
 * to log-in, and the hidden orderbook
 */
export const AllDarknodes: React.FC<{}> = () => {

    const { address, renNetwork: network } = Web3Container.useContainer();
    const { darknodeDetails, darknodeNames, darknodeRegisteringList, registrySync, darknodeList, hiddenDarknodes } = NetworkContainer.useContainer();

    const accountDarknodeList = useMemo(() => address ? darknodeList.get(address, null) : null, [address, darknodeList]);
    const accountHiddenDarknodes = useMemo(() => address ? hiddenDarknodes.get(address, null) : null, [address, hiddenDarknodes]);

    const shownDarknodeList = !accountDarknodeList ? accountDarknodeList : accountDarknodeList.filter(d => !accountHiddenDarknodes || !accountHiddenDarknodes.contains(d));

    return (
        <div className="home" key={`${address || undefined} ${network.name}`}>
            <div className="container">
                {darknodeRegisteringList.size > 0 ? <>
                    <h2>Continue registering</h2>
                    <ErrorBoundary><DarknodeList
                        darknodeDetails={darknodeDetails}
                        darknodeNames={darknodeNames}
                        darknodeList={darknodeRegisteringList.keySeq().toOrderedSet()}
                        darknodeRegisteringList={darknodeRegisteringList}
                        registrySync={registrySync}
                    /></ErrorBoundary>
                    {(shownDarknodeList && shownDarknodeList.size > 0) ? <h2>Current darknodes</h2> : null}
                </> : null}
                {darknodeRegisteringList.size === 0 || (shownDarknodeList && shownDarknodeList.size > 0) ? <ErrorBoundary><DarknodeList
                    darknodeDetails={darknodeDetails}
                    darknodeNames={darknodeNames}
                    darknodeList={shownDarknodeList}
                    darknodeRegisteringList={darknodeRegisteringList}
                    registrySync={registrySync}
                /></ErrorBoundary> : null}
            </div>
        </div>
    );
};
