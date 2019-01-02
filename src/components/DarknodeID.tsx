import * as React from "react";

import { EncodedData, Encodings } from "../lib/general/encodedData";

interface DarknodeIDProps {
    darknodeID: string;
}

interface DarknodeIDState {
}

export class DarknodeID extends React.Component<DarknodeIDProps, DarknodeIDState> {
    public render(): JSX.Element {
        const { darknodeID } = this.props;

        const darknodeIDBase58 = new EncodedData(darknodeID, Encodings.HEX).toBase58();

        return <div className="monospace darknode-id">{darknodeIDBase58}</div>;
    }
}

