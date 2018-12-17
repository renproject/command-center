import * as React from "react";

import BigNumber from "bignumber.js";

import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { withdrawReward } from "@Actions/trader/darknode";
import { Token } from "@Library/tokens";
import { ApplicationData } from "@Reducers/types";


interface FeesProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    operator: boolean;
    token: Token;
    amount: string | BigNumber;
    darknodeID: string;
}

interface FeesState {
    disabled: boolean;
}

class FeesItemClass extends React.Component<FeesProps, FeesState> {
    constructor(props: FeesProps) {
        super(props);
        this.state = {
            disabled: (new BigNumber(this.props.amount)).lt(0)
        };
    }

    public render(): JSX.Element {
        return (
            <button className="withdraw-fees" disabled={this.state.disabled || !this.props.operator} onClick={this.handleWithdraw}>
                <FontAwesomeIcon icon={faChevronRight} pull="left" />
            </button>
        );
    }

    private handleWithdraw = async (): Promise<void> => {
        const { store, darknodeID, token } = this.props;
        const { sdk } = store;
        this.setState({ disabled: true });

        this.props.actions.withdrawReward(sdk, darknodeID, token);
    }
}


const mapStateToProps = (state: ApplicationData) => ({
    store: {
        sdk: state.trader.sdk,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        withdrawReward,
    }, dispatch),
});

export const FeesItem = connect(mapStateToProps, mapDispatchToProps)(FeesItemClass);

