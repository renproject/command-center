import * as React from "react";

import BigNumber from "bignumber.js";

import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators, Dispatch } from "redux";

import { OldToken, Token } from "../../lib/ethereum/tokens";
import { updateDarknodeStatistics } from "../../store/actions/statistics/operatorActions";
import { withdrawReward } from "../../store/actions/trader/darknode";
import { ApplicationData } from "../../store/types";
import { Loading } from "../Loading";

const defaultState = { // Entries must be immutable
    loading: false,
};

class FeesItemClass extends React.Component<Props, typeof defaultState> {
    constructor(props: Props) {
        super(props);
        this.state = defaultState;
    }

    public render = (): JSX.Element => {
        const { loading } = this.state;
        const disabled = (new BigNumber(this.props.amount)).lte(0) || !this.props.disabled;
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
        const { web3, tokenPrices, address, ethNetwork } = store;
        this.setState({ loading: true });

        if (address) {
            try {
                // tslint:disable-next-line: await-promise
                await this.props.actions.withdrawReward(web3, ethNetwork, address, darknodeID, token);
            } catch (error) {
                this.setState({ loading: false });
                return;
            }
            // tslint:disable-next-line: await-promise
            await this.props.actions.updateDarknodeStatistics(web3, ethNetwork, darknodeID, tokenPrices);
        }

        this.setState({ loading: false });
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        web3: state.trader.web3,
        tokenPrices: state.statistics.tokenPrices,
        address: state.trader.address,
        withdrawAddresses: state.statistics.withdrawAddresses,
        ethNetwork: state.trader.ethNetwork,
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
    token: Token | OldToken;
    amount: string | BigNumber;
    darknodeID: string;
}

export const FeesItem = connect(mapStateToProps, mapDispatchToProps)(FeesItemClass);
