import { List } from "immutable";
import React, { useMemo } from "react";
import { RegistrationStatus } from "../../../lib/ethereum/contractReads";

import {
    DarknodesState,
    NetworkContainer,
} from "../../../store/networkContainer";
import { Web3Container } from "../../../store/web3Container";
import { ErrorBoundary } from "../../common/ErrorBoundary";
import { DarknodeCardList } from "./DarknodeCardList";
import { WithdrawAll } from "./WithdrawAll";

/**
 * Home is a page whose principal components are wallet selection to allow users
 * to log-in, and the hidden orderbook
 */
export const AllDarknodes: React.FC<{}> = () => {
    const { address, renNetwork: network } = Web3Container.useContainer();
    const {
        darknodeDetails,
        darknodeNames,
        darknodeRegisteringList,
        registrySync,
        darknodeList,
        hiddenDarknodes,
    } = NetworkContainer.useContainer();

    // TODO: here
    const accountDarknodeList = useMemo(
        () => (address ? darknodeList.get(address, null) : null),
        [address, darknodeList],
    );

    console.log("a", accountDarknodeList?.toJS());
    console.log("h", hiddenDarknodes?.toJS());

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

    const shownDarknodeDetails = shownDarknodeList
        ? (shownDarknodeList
              .toList()
              .map((darknode) => darknodeDetails.get(darknode))
              .filter((x) => !!x) as List<DarknodesState>)
        : shownDarknodeList;

    const withdrawableDetails = shownDarknodeDetails
        ? shownDarknodeDetails.filter(
              (details) =>
                  details.registrationStatus === RegistrationStatus.Registered,
          )
        : shownDarknodeDetails;

    console.log("aa");
    return (
        <div className="home" key={`${address || ""} ${network.name}`}>
            <div className="container">
                {shownDarknodeList && shownDarknodeList.size > 0 ? (
                    <ErrorBoundary>
                        <WithdrawAll darknodeList={withdrawableDetails} />
                    </ErrorBoundary>
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
