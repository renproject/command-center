import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import { storeSelectedDarknode, StoreSelectedDarknodeAction } from "@Actions/statistics/operatorActions";
import { ApplicationData, DarknodeDetails } from "@Reducers/types";
import { List } from "immutable";
import { Blocky } from "./Blocky";

interface StoreProps {
    darknodeList: List<string>;
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
class SidebarClass extends React.Component<SidebarProps> {
    public constructor(props: SidebarProps, context: object) {
        super(props, context);
    }

    public render(): JSX.Element {
        const { darknodeList, selectedDarknode } = this.props;

        return (
            <div className="sidebar">
                {
                    darknodeList === null ?
                        <span className="sidebar--text">...</span>
                        :
                        darknodeList.size === 0 ?
                            <span className="sidebar--text">...</span>
                            :
                            <ul>
                                <li>O</li>
                                <li>....</li>
                                {darknodeList && darknodeList.map((darknodeID) => {
                                    // tslint:disable-next-line:jsx-no-lambda FIXME
                                    return <li key={darknodeID} onClick={() => this.onClick(darknodeID)} className={darknodeID === selectedDarknode ? "sidebar--active" : ""}>
                                        <Blocky address={darknodeID} />
                                    </li>;
                                }).toArray()}
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
        darknodeList: state.statistics.darknodeList,
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

export const Sidebar = connect(mapStateToProps, mapDispatchToProps)(SidebarClass);
