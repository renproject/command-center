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
import { Web3Container } from "../../../store/web3Container";

interface Props {
    disabled: boolean;
    token: TokenString;
    amount: TokenAmount | null;
    withdrawCallback: (
        tokenSymbol: string,
        tokenAddress: string,
    ) => Promise<void>;
}

export const FeesItem: React.FC<Props> = ({
    token,
    amount,
    disabled,
    withdrawCallback,
}) => {
    const { address } = Web3Container.useContainer();

    const [loading, setLoading] = useState(false);

    const handleWithdraw = useCallback(async (): Promise<void> => {
        setLoading(true);

        if (address && amount && amount.asset && amount.asset.tokenAddress) {
            try {
                await withdrawCallback(
                    amount.symbol || token,
                    amount.asset.tokenAddress,
                );
            } catch (error) {
                console.error(error);
                setLoading(false);
                return;
            }
        }

        setLoading(false);
    }, [address, token, amount, withdrawCallback]);

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
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: 5 }}>UPDATING</span> <Loading />
                </div>
            ) : (
                <FontAwesomeIcon
                    icon={faChevronRight as FontAwesomeIconProps["icon"]}
                    pull="left"
                />
            )}
        </button>
    );
};
