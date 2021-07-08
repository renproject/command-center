import { List, OrderedSet } from "immutable";
import React, { useEffect, useMemo } from "react";
import { RegistrationStatus } from "../../../lib/ethereum/contractReads";

import {
    DarknodesState,
    NetworkContainer,
} from "../../../store/networkContainer";
import { Web3Container } from "../../../store/web3Container";
import { ErrorBoundary } from "../../common/ErrorBoundary";
import { DarknodeCardList } from "./DarknodeCardList";
import { RenVmFeesAll } from "./RenVmFeesAll";
import { WithdrawAll } from "./WithdrawAll";

/**
 * Home is a page whose principal components are wallet selection to allow users
 * to log-in, and the hidden orderbook
 */
export const AllDarknodes: React.FC<{}> = () => {
    const { address, renNetwork: network } = Web3Container.useContainer();
    const {
        darknodeDetails, // TODO: crit simplify
        darknodeNames,
        darknodeRegisteringList,
        registrySync,
        darknodeList,
        hiddenDarknodes,
        fetchBlockState,
    } = NetworkContainer.useContainer();

    // TODO: here
    const accountDarknodeList = useMemo(
        () => (address ? darknodeList.get(address, null) : null),
        [address, darknodeList],
    );

    useEffect(() => {
        fetchBlockState().catch(console.error);

        const interval = setInterval(() => {
            fetchBlockState().catch(console.error);
        }, 180 * 1000);

        return () => clearInterval(interval);
    }, [fetchBlockState]);

    const accountHiddenDarknodes = useMemo(
        () => (address ? hiddenDarknodes.get(address, null) : null),
        [address, hiddenDarknodes],
    );

    const shownDarknodeList = !accountDarknodeList
        ? accountDarknodeList
        : accountDarknodeList.filter(
              (d) =>
                  !accountHiddenDarknodes ||
                  !accountHiddenDarknodes.contains(d),
          );

    const shownDarknodeDetails = (shownDarknodeList || OrderedSet())
        .toList()
        .map((darknode) => darknodeDetails.get(darknode))
        .filter((x) => !!x) as List<DarknodesState>;

    const withdrawableDetails = shownDarknodeDetails.filter(
        (details) =>
            details.registrationStatus === RegistrationStatus.Registered,
    );

    return (
        <div className="home" key={`${address || ""} ${network.name}`}>
            <div className="container">
                {shownDarknodeList && shownDarknodeList.size > 0 ? (
                    <>
                        <ErrorBoundary>
                            <h2>Ethereum Fees</h2>
                            <WithdrawAll darknodeList={withdrawableDetails} />
                            <h2>RenVM Fees</h2>
                            <p className="field-info field-info--supplemental">
                                RenVM rewards currently needs to be claimed
                                individually for each Darknode. Click on the
                                Darknode below the summary table to proceed.
                            </p>
                            <RenVmFeesAll darknodeList={withdrawableDetails} />
                        </ErrorBoundary>
                    </>
                ) : null}
                {darknodeRegisteringList.size > 0 ? (
                    <>
                        <h2>Continue registering</h2>
                        <ErrorBoundary>
                            <DarknodeCardList
                                darknodeDetails={darknodeDetails}
                                darknodeNames={darknodeNames}
                                darknodeList={darknodeRegisteringList
                                    .keySeq()
                                    .toOrderedSet()}
                                darknodeRegisteringList={
                                    darknodeRegisteringList
                                }
                                registrySync={registrySync}
                            />
                        </ErrorBoundary>
                        {shownDarknodeList && shownDarknodeList.size > 0 ? (
                            <h2>Current darknodes</h2>
                        ) : null}
                    </>
                ) : null}
                {darknodeRegisteringList.size === 0 ||
                (shownDarknodeList && shownDarknodeList.size > 0) ? (
                    <ErrorBoundary>
                        <DarknodeCardList
                            darknodeDetails={darknodeDetails}
                            darknodeNames={darknodeNames}
                            darknodeList={shownDarknodeList}
                            darknodeRegisteringList={darknodeRegisteringList}
                            registrySync={registrySync}
                        />
                    </ErrorBoundary>
                ) : null}
            </div>
        </div>
    );
};
