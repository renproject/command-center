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

class FeesItemClass extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            loading: false,
        };
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
        const { web3, tokenPrices, address } = store;
        this.setState({ loading: true });

        if (address) {
            try {
                // tslint:disable-next-line: await-promise
                console.log("handleWithdraw");
                await this.props.actions.withdrawReward(web3, address, darknodeID, token);
            } catch (error) {
                this.setState({ loading: false });
                return;
            }
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
        withdrawAddresses: state.statistics.withdrawAddresses,
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

interface State {
    loading: boolean;
}

export const FeesItem = connect(mapStateToProps, mapDispatchToProps)(FeesItemClass);
