import * as React from "react";

import { Map } from "immutable";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { Blocky } from "@Components/Blocky";

import { storeSelectedDarknode } from "@Actions/statistics/operatorActions";
import { ApplicationData, DarknodeDetails } from "@Reducers/types";

interface DarknodeCardProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    darknodeID: string;
    darknodeDetails: DarknodeDetails | null;
}

interface DarknodeCardState {
    network: string;
    success: boolean;
    minBond: number;
    refreshing: boolean;
    correctNetwork: boolean;
    darknodeActionCalled: Map<string, boolean>;
}

class DarknodeCardClass extends React.Component<DarknodeCardProps, DarknodeCardState> {

    public constructor(props: DarknodeCardProps, context: object) {
        super(props, context);
        this.state = {
            network: "",
            success: false,
            minBond: 0,
            refreshing: false,
            correctNetwork: true,
            darknodeActionCalled: Map(),
        };
    }

    public render(): JSX.Element {
        const { darknodeID } = this.props;

        return (
            <div className="darknode-card" onClick={this.onClick}>
                <Blocky address={darknodeID} />
                <h3>Darknode</h3>
            </div>
        );
    }

    public onClick = (e: React.MouseEvent<HTMLDivElement>) => {
        this.props.actions.storeSelectedDarknode({ selectedDarknode: this.props.darknodeID });
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        tokenPrices: state.statistics.tokenPrices,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        storeSelectedDarknode,
    }, dispatch),
});

export const DarknodeCard = connect(mapStateToProps, mapDispatchToProps)(DarknodeCardClass);

