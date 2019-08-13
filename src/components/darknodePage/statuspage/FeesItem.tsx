import * as React from "react";

import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { OldToken, Token } from "../../../lib/ethereum/tokens";
import { waitForTX } from "../../../lib/ethereum/waitForTX";
import { withdrawReward } from "../../../store/account/darknodeActions";
import { ApplicationState } from "../../../store/applicationState";
import { updateDarknodeDetails } from "../../../store/network/operatorActions";
import { AppDispatch } from "../../../store/rootReducer";

const FeesItemClass = ({ darknodeID, token, amount, disabled, actions, store }: Props) => {
    const [loading, setLoading] = React.useState(false);

    const handleWithdraw = React.useCallback(async (): Promise<void> => {
        const { web3, tokenPrices, address, renNetwork } = store;
        setLoading(true);

        if (address) {
            try {
                // tslint:disable-next-line: await-promise
                await actions.withdrawReward(darknodeID, token, actions.waitForTX);
            } catch (error) {
                setLoading(false);
                return;
            }
            // tslint:disable-next-line: await-promise
            await actions.updateDarknodeDetails(web3, renNetwork, darknodeID, tokenPrices);
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
            {loading ? <Loading alt /> : <FontAwesomeIcon icon={faChevronRight} pull="left" />}
        </button>
    );
};

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        web3: state.account.web3,
        tokenPrices: state.network.tokenPrices,
        address: state.account.address,
        withdrawAddresses: state.network.withdrawAddresses,
        renNetwork: state.account.renNetwork,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        withdrawReward,
        updateDarknodeDetails,
        waitForTX,
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
