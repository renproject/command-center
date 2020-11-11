import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import {
    FontAwesomeIcon,
    FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React, { useCallback, useState } from "react";

import { AllTokenDetails, Token } from "../../../lib/ethereum/tokens";
import { classNames } from "../../../lib/react/className";
import { MINIMUM_SHIFTED_AMOUNT } from "../../../lib/react/environmentVariables";
import { NetworkContainer } from "../../../store/networkContainer";
import { Web3Container } from "../../../store/web3Container";

interface Props {
    disabled: boolean;
    token: Token;
    amount: string | BigNumber;
    darknodeID: string;
}

export const FeesItem: React.FC<Props> = ({
    darknodeID,
    token,
    amount,
    disabled,
}) => {
    const {
        withdrawReward,
        updateDarknodeDetails,
    } = NetworkContainer.useContainer();
    const { address } = Web3Container.useContainer();

    const [loading, setLoading] = useState(false);

    const tokenDetails = AllTokenDetails.get(token);
    const wrapped = tokenDetails ? tokenDetails.wrapped : false;
    const decimals = tokenDetails ? tokenDetails.decimals : 8;

    const handleWithdraw = useCallback(async (): Promise<void> => {
        setLoading(true);

        if (address && tokenDetails) {
            try {
                await withdrawReward(darknodeID, token);
            } catch (error) {
                console.error(error);
                setLoading(false);
                return;
            }
            await updateDarknodeDetails(darknodeID);
        }

        setLoading(false);
    }, [
        withdrawReward,
        updateDarknodeDetails,
        darknodeID,
        address,
        token,
        tokenDetails,
    ]);

    let isDisabled = false;
    let title = "";
    if (disabled) {
        isDisabled = true;
        title = "Must be operator to withdraw";
    } else if (new BigNumber(amount).lte(0)) {
        isDisabled = true;
        title = "No fees to withdraw";
    } else if (
        wrapped &&
        new BigNumber(amount).lte(
            new BigNumber(MINIMUM_SHIFTED_AMOUNT).times(
                new BigNumber(10).exponentiatedBy(decimals),
            ),
        )
    ) {
        isDisabled = true;
        title = `Minimum withdraw is ${MINIMUM_SHIFTED_AMOUNT} ${token}`;
    }

    return (
        <button
            title={title}
            className={classNames(
                "withdraw-fees",
                isDisabled ? "withdraw-fees-disabled" : "",
            )}
            disabled={isDisabled || !tokenDetails || !tokenDetails.feesToken}
            onClick={isDisabled ? undefined : handleWithdraw}
        >
            {loading ? (
                <Loading alt />
            ) : (
                <FontAwesomeIcon
                    icon={faChevronRight as FontAwesomeIconProps["icon"]}
                    pull="left"
                />
            )}
        </button>
    );
};
