import * as React from "react";

import BigNumber from "bignumber.js";

import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { updateDarknodeStatistics } from "../../actions/statistics/operatorActions";
import { withdrawReward } from "../../actions/trader/darknode";
import { Token } from "../../lib/tokens";
import { ApplicationData } from "../../reducers/types";
import { Loading } from "../Loading";

interface FeesProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    disabled: boolean;
    token: Token;
    amount: string | BigNumber;
    darknodeID: string;
}

interface FeesState {
    disabled: boolean;
    loading: boolean;
}

class FeesItemClass extends React.Component<FeesProps, FeesState> {
    constructor(props: FeesProps) {
        super(props);
        this.state = {
            disabled: (new BigNumber(this.props.amount)).lte(0),
            loading: false,
        };
    }

    public render(): JSX.Element {
        const { loading } = this.state;
        const disabled = this.state.disabled || !this.props.disabled;
        return (
            <button
                className="withdraw-fees"
                disabled={disabled}
                onClick={disabled ? undefined : this.handleWithdraw}
            >
                {loading ? <Loading /> : <FontAwesomeIcon icon={faChevronRight} pull="left" />}
            </button>
        );
    }

    private handleWithdraw = async (): Promise<void> => {
        const { store, darknodeID, token } = this.props;
        const { sdk, tokenPrices } = store;
        this.setState({ disabled: true, loading: true });

        await this.props.actions.withdrawReward(sdk, darknodeID, token);
        await this.props.actions.updateDarknodeStatistics(sdk, darknodeID, tokenPrices);

        this.setState({ loading: false });
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        sdk: state.trader.sdk,
        tokenPrices: state.statistics.tokenPrices,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        withdrawReward,
        updateDarknodeStatistics,
    }, dispatch),
});

export const FeesItem = connect(mapStateToProps, mapDispatchToProps)(FeesItemClass);
