import * as React from "react";

import { darknodeIDHexToBase58 } from "./pages/Darknode";

interface DarknodeIDProps {
    darknodeID: string;
}

interface DarknodeIDState {
}

export class DarknodeID extends React.Component<DarknodeIDProps, DarknodeIDState> {
    public render(): JSX.Element {
        const { darknodeID } = this.props;

        const darknodeIDBase58 = darknodeIDHexToBase58(darknodeID);

        return <div className="monospace darknode-id">{darknodeIDBase58}</div>;
    }
}
