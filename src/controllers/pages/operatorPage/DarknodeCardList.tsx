import { Loading } from "@renproject/react-components";
import { Map, OrderedSet } from "immutable";
import React from "react";

import { DarknodesState } from "../../../store/networkContainer";
import { EmptyDarknodeCard } from "../../../views/darknodeCards/EmptyDarknodeCard";
import { EmptyDarknodeList } from "../../../views/darknodeCards/EmptyDarknodeList";
import { ErrorBoundary } from "../../common/ErrorBoundary";
import { DarknodeCardController } from "./DarknodeCardController";

interface Props {
    darknodeList: OrderedSet<string> | null;
    darknodeDetails: Map<string, DarknodesState>;
    darknodeNames: Map<string, string>;
    darknodeRegisteringList: Map<string, boolean>;
    registrySync: { progress: number; target: number };
}

export const DarknodeCardList: React.FC<Props> = ({
    darknodeList,
    darknodeDetails,
    darknodeNames,
    darknodeRegisteringList,
    registrySync,
}) => {
    return (
        <div className="darknode-list">
            {darknodeList === null ? (
                <div className="darknode-list--loading">
                    <Loading alt />
                    <p>
                        Syncing Darknode Registry{" "}
                        {registrySync.target !== 0 ? (
                            <>
                                ({registrySync.progress}/{registrySync.target})
                            </>
                        ) : null}
                    </p>
                </div>
            ) : (
                <>
                    {darknodeList &&
                        darknodeList
                            .map((darknodeID: string) => {
                                const details =
                                    darknodeDetails.get(darknodeID) || null;
                                const name = darknodeNames.get(darknodeID);

                                return (
                                    <ErrorBoundary key={darknodeID}>
                                        <DarknodeCardController
                                            key={darknodeID}
                                            name={name}
                                            darknodeID={darknodeID}
                                            darknodeDetails={details}
                                            registering={darknodeRegisteringList.get(
                                                darknodeID,
                                            )}
                                        />
                                    </ErrorBoundary>
                                );
                            })
                            .toArray()}
                    {darknodeList.size === 0 ? (
                        <EmptyDarknodeList />
                    ) : (
                        <>
                            {darknodeList.size < 2 ? (
                                <EmptyDarknodeCard className="second" />
                            ) : null}
                            {darknodeList.size < 3 ? (
                                <EmptyDarknodeCard className="third" />
                            ) : null}
                            {/* {darknodeList.size < 4 ? <EmptyDarknodeCard className="fourth" /> : null} */}
                        </>
                    )}
                </>
            )}
        </div>
    );
};
