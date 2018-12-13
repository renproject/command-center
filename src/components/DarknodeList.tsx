import * as React from "react";

import { List, Map } from "immutable";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import { storeSelectedDarknode, } from "@Actions/statistics/operatorActions";
import { ApplicationData, DarknodeDetails } from "@Reducers/types";
import { DarknodeCard } from "./DarknodeCard";
import { Loading } from "./Loading";

interface DarknodeListProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    darknodeList: List<string> | null;
    darknodeDetails: Map<string, DarknodeDetails>;
}

class DarknodeListClass extends React.Component<DarknodeListProps> {
    public constructor(props: DarknodeListProps, context: object) {
        super(props, context);
    }

    public render(): JSX.Element {
        const { darknodeList, darknodeDetails } = this.props;

        return (
            <div className="darknode-list">
                {
                    darknodeList === null ?
                        <Loading />
                        :
                        <>
                            {darknodeList && darknodeList.map((darknodeID) => {
                                const details = darknodeDetails ? darknodeDetails.get(darknodeID) || null : null;
                                return <DarknodeCard key={darknodeID} darknodeID={darknodeID} darknodeDetails={details} />;
                            }).toArray()}
                        </>
                }
            </div>
        );
    }
}


const mapStateToProps = (state: ApplicationData) => ({
    store: {
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        storeSelectedDarknode,
    }, dispatch),
});

export const DarknodeList = connect(mapStateToProps, mapDispatchToProps)(DarknodeListClass);
