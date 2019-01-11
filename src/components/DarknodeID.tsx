import * as React from "react";

import { darknodeIDHexToBase58 } from "./pages/Darknode";

interface Props {
    darknodeID: string;
}

export const DarknodeID = (props: Props): JSX.Element => {
    const { darknodeID } = props;

    const darknodeIDBase58 = darknodeIDHexToBase58(darknodeID);

    return <div className="monospace darknode-id">{darknodeIDBase58}</div>;
};
