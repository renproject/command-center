import * as React from "react";

import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";

import { AllTokenDetails, OldToken, Token } from "../../lib/ethereum/tokens";
import { NetworkStateContainer } from "../../store/networkStateContainer";
import { Web3Container } from "../../store/web3Store";

const minimumShiftedAmount = 0.0004;

interface Props {
    disabled: boolean;
    token: Token | OldToken;
    amount: string | BigNumber;
    darknodeID: string;
}

export const FeesItem: React.FC<Props> = ({ darknodeID, token, amount, disabled }) => {
    const { withdrawReward, updateDarknodeDetails } = NetworkStateContainer.useContainer();
    const { address } = Web3Container.useContainer();

    const [loading, setLoading] = React.useState(false);

    const tokenDetails = AllTokenDetails.get(token);
    const wrapped = tokenDetails ? tokenDetails.wrapped : false;
    const decimals = tokenDetails ? tokenDetails.decimals : 8;

    const handleWithdraw = React.useCallback(async (): Promise<void> => {
        setLoading(true);

        if (address && tokenDetails && !tokenDetails.old) {
            try {
                await withdrawReward(darknodeID, token as Token);
            } catch (error) {
                console.error(error);
                setLoading(false);
                return;
            }
            await updateDarknodeDetails(darknodeID);
        }

        setLoading(false);
    }, [withdrawReward, updateDarknodeDetails, darknodeID, address, token, tokenDetails]);

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
        title = `Minimum withdraw is ${minimumShiftedAmount} ${token}`;
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
