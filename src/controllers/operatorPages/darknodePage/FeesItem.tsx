import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import {
    FontAwesomeIcon,
    FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React, { useCallback, useState } from "react";

import { TokenString } from "../../../lib/ethereum/tokens";
import { TokenAmount } from "../../../lib/graphQL/queries/queries";
import { classNames } from "../../../lib/react/className";
import { NetworkContainer } from "../../../store/networkContainer";
import { Web3Container } from "../../../store/web3Container";

interface Props {
    disabled: boolean;
    token: TokenString;
    amount: TokenAmount | null;
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

    const handleWithdraw = useCallback(async (): Promise<void> => {
        setLoading(true);

        if (address && amount && amount.asset && amount.asset.tokenAddress) {
            try {
                await withdrawReward(
                    darknodeID,
                    amount.symbol || token,
                    amount.asset.tokenAddress,
                );
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
        amount,
    ]);

    let isDisabled = false;
    let title = "";
    if (disabled) {
        isDisabled = true;
        title = "Must be operator to withdraw";
    } else if (!amount || new BigNumber(amount.amount).lte(0)) {
        isDisabled = true;
        title = "No fees to withdraw";
    } else if (!amount.asset || !amount.asset.tokenAddress) {
        isDisabled = true;
        title = "Unable to look up token address";
    }

    return (
        <button
            title={title}
            className={classNames(
                "withdraw-fees",
                isDisabled ? "withdraw-fees-disabled" : "",
            )}
            disabled={isDisabled}
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
