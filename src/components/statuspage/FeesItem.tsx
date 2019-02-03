import * as React from "react";

import BigNumber from "bignumber.js";

import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators, Dispatch } from "redux";

import { updateDarknodeStatistics } from "../../actions/statistics/operatorActions";
import { withdrawReward } from "../../actions/trader/darknode";
import { Token } from "../../lib/ethereum/tokens";
import { ApplicationData } from "../../reducers/types";
import { Loading } from "../Loading";

class FeesItemClass extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            disabled: (new BigNumber(this.props.amount)).lte(0),
            loading: false,
        };
    }

    public render = (): JSX.Element => {
        const { loading } = this.state;
        const disabled = this.state.disabled || !this.props.disabled;
        return (
            <button
                className="withdraw-fees"
                disabled={disabled}
                onClick={disabled ? undefined : this.handleWithdraw}
            >
                {loading ? <Loading alt={true} /> : <FontAwesomeIcon icon={faChevronRight} pull="left" />}
            </button>
        );
    }

    private readonly handleWithdraw = async (): Promise<void> => {
        const { store, darknodeID, token } = this.props;
        const { sdk, tokenPrices, address } = store;
        this.setState({ disabled: true, loading: true });

        if (sdk && address) {
            // tslint:disable-next-line: await-promise
            await this.props.actions.withdrawReward(sdk, address, darknodeID, token);
            // tslint:disable-next-line: await-promise
            await this.props.actions.updateDarknodeStatistics(sdk, darknodeID, tokenPrices);
        }

        this.setState({ loading: false });
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        sdk: state.trader.sdk,
        tokenPrices: state.statistics.tokenPrices,
        address: state.trader.address,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        withdrawReward,
        updateDarknodeStatistics,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    disabled: boolean;
    token: Token;
    amount: string | BigNumber;
    darknodeID: string;
}

interface State {
    disabled: boolean;
    loading: boolean;
}

export const FeesItem = connect(mapStateToProps, mapDispatchToProps)(FeesItemClass);
