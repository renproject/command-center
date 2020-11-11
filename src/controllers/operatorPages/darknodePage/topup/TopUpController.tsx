import { Currency, CurrencyIcon } from "@renproject/react-components";
import { BigNumber } from "bignumber.js";
import React, { useEffect, useState } from "react";

import { Token } from "../../../../lib/ethereum/tokens";
import { catchBackgroundException } from "../../../../lib/react/errors";
import { NetworkContainer } from "../../../../store/networkContainer";
import { Web3Container } from "../../../../store/web3Container";
import { TokenBalance } from "../../../common/TokenBalance";
import { TopUp } from "./TopUp";

export const CONFIRMATION_MESSAGE = "Transaction confirmed.";

export const TopUpController: React.FC<Props> = ({ darknodeID }) => {
    const { address, web3 } = Web3Container.useContainer();
    const {
        updateDarknodeDetails,
        showFundPopup,
    } = NetworkContainer.useContainer();

    const [value, setValue] = useState("");
    const [resultMessage, setResultMessage] = useState<React.ReactNode>(null);
    const [pending, setPending] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [accountBalance, setAccountBalance] = useState(new BigNumber(0));

    const handleChange = (newValue: string): void => {
        setValue(newValue.toString());

        // If input is invalid, show an error.
        if (isNaN(parseFloat(newValue)) || parseFloat(newValue) <= 0) {
            setDisabled(true);
            setResultMessage(null);
        } else if (!address) {
            setResultMessage(<>Please connect your Web3 wallet first.</>);
        } else if (accountBalance.isLessThan(newValue)) {
            setResultMessage(
                <>
                    Insufficient balance. Maximum deposit:{" "}
                    <CurrencyIcon currency={Currency.ETH} />
                    <TokenBalance
                        token={Token.ETH}
                        amount={accountBalance.times(new BigNumber(10).pow(18))}
                        digits={3}
                    />
                </>,
            );
            setDisabled(true);
        } else if (resultMessage || disabled) {
            setResultMessage(null);
            setDisabled(false);
        }
    };

    const updateTraderBalance = async (): Promise<BigNumber> => {
        let traderBalance;
        if (!address) {
            traderBalance = new BigNumber(0);
        } else {
            traderBalance = new BigNumber(
                (await web3.eth.getBalance(address)).toString(),
            ).div(new BigNumber(10).exponentiatedBy(18));
        }
        setAccountBalance(traderBalance);
        return traderBalance;
    };

    const handleBlur = async (): Promise<void> => {
        let traderBalance;
        try {
            traderBalance = await updateTraderBalance();
            if (traderBalance.isLessThan(value)) {
                setValue(traderBalance.toFormat());
                setDisabled(true);
            }
        } catch (error) {
            catchBackgroundException(
                error,
                "Error in TopUpController > handleBlur",
            );
        }
    };

    const sendFunds = async (): Promise<void> => {
        setResultMessage("");
        setPending(true);

        if (!address) {
            setResultMessage(`Invalid account.`);
            setPending(false);
            return;
        }

        const onCancel = () => {
            setPending(false);
        };

        const onDone = async () => {
            try {
                await updateDarknodeDetails(darknodeID);
            } catch (error) {
                // Ignore error
            }

            setResultMessage(CONFIRMATION_MESSAGE);
            setPending(false);

            // If the user hasn't changed the value, set it to 0.
            setValue((currentValue) =>
                currentValue === value ? "0" : currentValue,
            );
        };

        showFundPopup(darknodeID, value, onCancel, onDone);
    };

    useEffect(() => {
        updateTraderBalance().catch((error) => {
            catchBackgroundException(
                error,
                "Error in TopUpController > updateTraderBalance",
            );
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <TopUp
            value={value}
            resultMessage={resultMessage}
            pending={pending}
            disabled={disabled}
            handleChange={handleChange}
            handleBlur={handleBlur}
            sendFunds={sendFunds}
        />
    );
};

interface Props {
    darknodeID: string;
}
