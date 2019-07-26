import * as React from "react";

import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators, Dispatch } from "redux";

import { OldToken, Token } from "../../lib/ethereum/tokens";
import { updateDarknodeStatistics } from "../../store/actions/statistics/operatorActions";
import { withdrawReward } from "../../store/actions/trader/darknode";
import { ApplicationData } from "../../store/types";

const FeesItemClass = ({ darknodeID, token, amount, disabled, actions, store }: Props) => {
    const [loading, setLoading] = React.useState(false);

    const handleWithdraw = React.useCallback(async (): Promise<void> => {
        const { web3, tokenPrices, address, renNetwork } = store;
        setLoading(true);

        if (address) {
            try {
                // tslint:disable-next-line: await-promise
                await actions.withdrawReward(web3, renNetwork, address, darknodeID, token);
            } catch (error) {
                setLoading(false);
                return;
            }
            // tslint:disable-next-line: await-promise
            await actions.updateDarknodeStatistics(web3, renNetwork, darknodeID, tokenPrices);
        }

        setLoading(false);
    }, [actions, darknodeID, store, token]);

    const isDisabled = (new BigNumber(amount)).lte(0) || !disabled;
    return (
        <button
            className="withdraw-fees"
            disabled={isDisabled}
            onClick={isDisabled ? undefined : handleWithdraw}
        >
            {loading ? <Loading alt={true} /> : <FontAwesomeIcon icon={faChevronRight} pull="left" />}
        </button>
    );
};

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        web3: state.trader.web3,
        tokenPrices: state.statistics.tokenPrices,
        address: state.trader.address,
        withdrawAddresses: state.statistics.withdrawAddresses,
        renNetwork: state.trader.renNetwork,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        withdrawReward,
        updateDarknodeStatistics,
    }, dispatch),
});

// tslint:disable: react-unused-props-and-state
interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    disabled: boolean;
    token: Token | OldToken;
    amount: string | BigNumber;
    darknodeID: string;
}

export const FeesItem = connect(mapStateToProps, mapDispatchToProps)(FeesItemClass);
