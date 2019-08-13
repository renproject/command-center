import * as React from "react";

import { Loading } from "@renproject/react-components";
import { List, Map } from "immutable";

import { DarknodesState } from "../../../store/applicationState";
import { _catch_ } from "../../common/ErrorBoundary";
import { DarknodeCard } from "./DarknodeCard";
import { EmptyDarknodeCard } from "./EmptyDarknodeCard";
import { EmptyDarknodeList } from "./EmptyDarknodeList";

interface Props {
    darknodeList: List<string> | null;
    darknodeDetails: Map<string, DarknodesState>;
    darknodeNames: Map<string, string>;
    darknodeRegisteringList: Map<string, string>;
    registrySync: { progress: number, target: number };
}

export const DarknodeList: React.StatelessComponent<Props> = ({
    darknodeList,
    darknodeDetails,
    darknodeNames,
    darknodeRegisteringList,
    registrySync
}) => {
    return <div className={`darknode-list`}>
        {darknodeList === null ? <div className="darknode-list--loading">
            <Loading alt />
            <p>Syncing Darknode Registry {registrySync.target !== 0 ? <>({registrySync.progress}/{registrySync.target})</> : <></>}</p>
        </div> : <>
                {darknodeList && darknodeList.map((darknodeID: string) => {
                    const details = darknodeDetails.get(darknodeID) || null;
                    const name = darknodeNames.get(darknodeID);

                    return _catch_(<DarknodeCard
                        key={darknodeID}
                        name={name}
                        darknodeID={darknodeID}
                        darknodeDetails={details}
                        publicKey={darknodeRegisteringList.get(darknodeID)}
                    />, { key: darknodeID });
                }).toArray()}
                {darknodeList.size === 0 ? <EmptyDarknodeList /> : <>
                    {darknodeList.size < 2 ? <EmptyDarknodeCard className="second" /> : null}
                    {darknodeList.size < 3 ? <EmptyDarknodeCard className="third" /> : null}
                    {darknodeList.size < 4 ? <EmptyDarknodeCard className="fourth" /> : null}
                </>}
            </>}
    </div>;
};
