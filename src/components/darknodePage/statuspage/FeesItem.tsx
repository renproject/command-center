import * as React from "react";

import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { AllTokenDetails, OldToken, Token } from "../../../lib/ethereum/tokens";
import { waitForTX } from "../../../lib/ethereum/waitForTX";
import { updateDarknodeDetails, withdrawReward } from "../../../store/network/networkActions";
import { NetworkStateContainer } from "../../../store/networkStateContainer";
import { PopupContainer } from "../../../store/popupStore";
import { AppDispatch } from "../../../store/rootReducer";
import { Web3Container } from "../../../store/web3Store";

const minimumShiftedAmount = 0.00016;

const FeesItemClass = ({ darknodeID, token, amount, disabled, actions }: Props) => {
    const { setPopup, clearPopup } = PopupContainer.useContainer();
    const { tokenPrices } = NetworkStateContainer.useContainer();
    const { web3, address, renNetwork } = Web3Container.useContainer();

    const [loading, setLoading] = React.useState(false);

    const tokenDetails = AllTokenDetails.get(token);
    const wrapped = tokenDetails ? tokenDetails.wrapped : false;
    const decimals = tokenDetails ? tokenDetails.decimals : 8;

    const handleWithdraw = React.useCallback(async (): Promise<void> => {
        setLoading(true);

        if (address && tokenDetails && !tokenDetails.old) {
            try {
                // tslint:disable-next-line: await-promise
                await actions.withdrawReward(web3, address, renNetwork, darknodeID, token as Token, actions.waitForTX, setPopup, clearPopup);
            } catch (error) {
                setLoading(false);
                return;
            }
            // tslint:disable-next-line: await-promise
            await actions.updateDarknodeDetails(web3, renNetwork, darknodeID, tokenPrices);
        }

        setLoading(false);
    }, [actions, darknodeID, web3, address, renNetwork, token]);

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

const mapStateToProps = () => ({});

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
