import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import { storeSelectedDarknode, StoreSelectedDarknodeAction } from "@Actions/statistics/operatorActions";
import { ApplicationData, DarknodeDetails } from "@Reducers/types";
import { OrderedMap } from "immutable";
import { Link } from "react-router-dom";
import Blocky from "./Blocky";

interface StoreProps {
    darknodeDetails: OrderedMap<string, DarknodeDetails | null> | null;
    selectedDarknode: string | null;
}

interface SidebarProps extends StoreProps {
    actions: {
        storeSelectedDarknode: StoreSelectedDarknodeAction;
    };
}

/**
 * Sidebar displays stats about an operator's darknodes collectively,
 * as well as a breakdown of each darknode
 */
class Sidebar extends React.Component<SidebarProps> {
    public constructor(props: SidebarProps, context: object) {
        super(props, context);
    }

    public render(): JSX.Element {
        const { darknodeDetails, selectedDarknode } = this.props;

        return (
            <div className="sidebar">
                {
                    darknodeDetails === null ?
                        <span className="sidebar--text">...</span>
                        :
                        darknodeDetails.size === 0 ?
                            <span className="sidebar--text">...</span>
                            :
                            <ul>
                                <li>O</li>
                                <li>....</li>
                                {darknodeDetails && darknodeDetails.map((darknodeDetail, darknodeID) => {
                                    // tslint:disable-next-line:jsx-no-lambda FIXME
                                    return <li key={darknodeID} onClick={() => this.onClick(darknodeID)} className={darknodeID === selectedDarknode ? "sidebar--active" : ""}>
                                        <Blocky address={darknodeID} />
                                    </li>;
                                }).valueSeq().toArray()}
                            </ul>
                }
            </div>
        );
    }

    public onClick = (darknodeID: string) => {
        this.props.actions.storeSelectedDarknode({ selectedDarknode: darknodeID });
    }
}


function mapStateToProps(state: ApplicationData): StoreProps {
    return {
        darknodeDetails: state.statistics.darknodeDetails,
        selectedDarknode: state.statistics.selectedDarknode,
    };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: SidebarProps["actions"] } {
    return {
        actions: bindActionCreators({
            storeSelectedDarknode,
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
