import * as React from "react";

import { List, Map } from "immutable";

import { DarknodeDetails } from "../reducers/types";
import { DarknodeCard } from "./DarknodeCard";
import { EmptyDarknodeCard } from "./EmptyDarknodeCard";
import { EmptyDarknodeList } from "./EmptyDarknodeList";
import { _catch_ } from "./ErrorBoundary";
import { Loading } from "./Loading";

export class DarknodeList extends React.Component<Props> {
    public constructor(props: Props, context: object) {
        super(props, context);
    }

    public render = (): JSX.Element => {
        const { darknodeList, darknodeDetails, darknodeNames, darknodeRegisteringList } = this.props;

        return (
            <div className={`darknode-list`}>
                {darknodeList === null ? <div className="darknode-list--loading"><Loading alt={true} /></div> : <>
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
            </div>
        );
    }
}

interface Props {
    darknodeList: List<string> | null;
    darknodeDetails: Map<string, DarknodeDetails>;
    darknodeNames: Map<string, string>;
    darknodeRegisteringList: Map<string, string>;
}
