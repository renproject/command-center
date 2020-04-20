import * as React from "react";

import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { AllTokenDetails, OldToken, Token } from "../../../lib/ethereum/tokens";
import { waitForTX } from "../../../lib/ethereum/waitForTX";
import { withdrawReward } from "../../../store/account/darknodeActions";
import { ApplicationState } from "../../../store/applicationState";
import { updateDarknodeDetails } from "../../../store/network/operatorActions";
import { PopupContainer } from "../../../store/popupStore";
import { AppDispatch } from "../../../store/rootReducer";

const minimumShiftedAmount = 0.00016;

const FeesItemClass = ({ darknodeID, token, amount, disabled, actions, store }: Props) => {
    const { setPopup, clearPopup } = PopupContainer.useContainer();
    const [loading, setLoading] = React.useState(false);

    const tokenDetails = AllTokenDetails.get(token);
    const wrapped = tokenDetails ? tokenDetails.wrapped : false;
    const decimals = tokenDetails ? tokenDetails.decimals : 8;

    const handleWithdraw = React.useCallback(async (): Promise<void> => {
        const { web3, tokenPrices, address, renNetwork } = store;
        setLoading(true);

        if (address && tokenDetails && !tokenDetails.old) {
            try {
                // tslint:disable-next-line: await-promise
                await actions.withdrawReward(darknodeID, token as Token, actions.waitForTX, setPopup, clearPopup);
            } catch (error) {
                setLoading(false);
                return;
            }
            // tslint:disable-next-line: await-promise
            await actions.updateDarknodeDetails(web3, renNetwork, darknodeID, tokenPrices);
        }

        setLoading(false);
    }, [actions, darknodeID, store, token]);

    let isDisabled = false;
    let title = "";
    if (disabled) {
        isDisabled = true;
        title = "Must be operator to withdraw";
    } else if ((new BigNumber(amount)).lte(0)) {
        isDisabled = true;
        title = "No fees to withdraw";
    } else if (wrapped && new BigNumber(amount).lte(new BigNumber(minimumShiftedAmount).times(new BigNumber(10).exponentiatedBy(decimals)))) {
        isDisabled = true;
        title = `Must have at least ${minimumShiftedAmount} ${token} to withdraw`;
    }

    return (
        <button
            title={title}
            className={["withdraw-fees", isDisabled ? "withdraw-fees-disabled" : ""].join(" ")}
            disabled={isDisabled || !tokenDetails || tokenDetails.old}
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
