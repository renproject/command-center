import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import { EncodedData, Encodings } from "@Library/general/encodedData";
import { ApplicationData, DarknodeDetails } from "@Reducers/types";

interface StoreProps {
}

interface DarknodeStatisticsProps extends StoreProps {
    darknodeID: string;
    darknodeDetails: DarknodeDetails | null;

    actions: {
    };
}

/**
 * DarknodeStatistics displays stats about an operator's darknodes collectively,
 * as well as a breakdown of each darknode
 */
class DarknodeStatistics extends React.Component<DarknodeStatisticsProps> {
    public constructor(props: DarknodeStatisticsProps, context: object) {
        super(props, context);
    }

    public render(): JSX.Element {
        const { darknodeID, darknodeDetails } = this.props;

        const darknodeID58 = new EncodedData("0x1b14" + darknodeID.slice(2), Encodings.HEX).toBase58();


        return (
            <tr className="darknodeStatistics">
                <td><div className="darknodeStatistics--name">{darknodeID58} <button className="darknodesList--view">View</button></div></td>
                <td>{darknodeID.substring(0, 8)}...{darknodeID.slice(-5)}</td>
                <td>{darknodeID.substring(0, 8)}...{darknodeID.slice(-5)}</td>
            </tr>
        );
    }
}


function mapStateToProps(state: ApplicationData): StoreProps {
    return {
    };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: DarknodeStatisticsProps["actions"] } {
    return {
        actions: bindActionCreators({
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DarknodeStatistics);
