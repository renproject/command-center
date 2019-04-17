import * as React from "react";

import BigNumber from "bignumber.js";

import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators, Dispatch } from "redux";

import { Token } from "../../lib/ethereum/tokens";
import { updateDarknodeStatistics } from "../../store/actions/statistics/operatorActions";
import { withdrawReward } from "../../store/actions/trader/darknode";
import { ApplicationData } from "../../store/types";
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
        const { web3, tokenPrices, address } = store;
        this.setState({ disabled: true, loading: true });

        if (address) {
            // tslint:disable-next-line: await-promise
            await this.props.actions.withdrawReward(web3, address, darknodeID, token);
            // tslint:disable-next-line: await-promise
            await this.props.actions.updateDarknodeStatistics(web3, darknodeID, tokenPrices);
        }

        this.setState({ loading: false });
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        sdk: state.trader.sdk,
        web3: state.trader.web3,
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
