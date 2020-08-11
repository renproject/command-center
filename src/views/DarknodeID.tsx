import React from "react";

import { darknodeIDHexToBase58 } from "../lib/darknode/darknodeID";

interface Props {
    darknodeID: string;
}

export const DarknodeID: React.FC<Props> = ({ darknodeID }) => (
    <div className="monospace darknode-id">
        {darknodeIDHexToBase58(darknodeID)}
    </div>
);
