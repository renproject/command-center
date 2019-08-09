import * as React from "react";

import { darknodeIDHexToBase58 } from "../darknodePage/Darknode";

export const DarknodeID = (props: Props): JSX.Element => {
    const { darknodeID } = props;

    const darknodeIDBase58 = darknodeIDHexToBase58(darknodeID);

    return <div className="monospace darknode-id">{darknodeIDBase58}</div>;
};

// tslint:disable: react-unused-props-and-state
interface Props {
    darknodeID: string;
}
