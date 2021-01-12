import React, { useCallback, useMemo, useState } from "react";

import { Tabs } from "../../../../views/Tabs";
import { Block, BlockBody, BlockTitle } from "../blocks/Block";

import { ReactComponent as FlameIcon } from "../../../../styles/images/icon-flame.svg";
import { Currency, CurrencyIcon } from "@renproject/react-components";
import { AnyTokenBalance } from "../../../common/TokenBalance";
import BigNumber from "bignumber.js";
import { catchBackgroundException } from "../../../../lib/react/errors";
import { fromWei } from "web3-utils";

interface Props {
    gasValue: string | null;
    address: string | null;
    balance: BigNumber | null;
    maxCallback: () => Promise<BigNumber>;
    topUpCallBack: (value: string) => Promise<void>;
}

enum Tab {
    Add = "Add",
    Withdraw = "Withdraw (CLI)",
}

export const GasBlock: React.FC<Props> = ({
    gasValue,
    address,
    balance,
    maxCallback,
    topUpCallBack,
}) => {
    const [value, setValue] = useState("");
    const [resultMessage, setResultMessage] = useState<React.ReactNode>(null);
    const [disabled, setDisabled] = useState(false);
    const [pending, setPending] = useState(false);

    const balanceInEth = useMemo(
        () =>
            balance
                ? new BigNumber(fromWei(balance.toFixed(), "ether").toString())
                : balance,
        [balance],
    );

    const handleMax = useCallback(async (): Promise<void> => {
        if (!address) {
            setResultMessage(<>Please connect your Web3 wallet first.</>);
            return;
        }

        try {
            handleChange((await maxCallback()).toFormat());
        } catch (error) {
            catchBackgroundException(
                error,
                "Error in TopUpController > handleMax",
            );
        }
    }, [address, maxCallback]);

    const handleChange = useCallback(
        (newValue: string): void => {
            setValue(newValue.toString());

            // If input is invalid, show an error.
            if (isNaN(parseFloat(newValue)) || parseFloat(newValue) <= 0) {
                setDisabled(true);
                setResultMessage(null);
            } else if (!address) {
                setResultMessage(<>Please connect your Web3 wallet first.</>);
            } else if (balanceInEth && balanceInEth.isLessThan(newValue)) {
                setResultMessage(
                    <>
                        Insufficient balance. Maximum deposit:{" "}
                        <span className="pointer" onClick={handleMax}>
                            <CurrencyIcon currency={Currency.ETH} />
                            <AnyTokenBalance
                                amount={balanceInEth}
                                digits={3}
                                decimals={0}
                            />
                        </span>
                    </>,
                );
                setDisabled(true);
            } else if (resultMessage || disabled) {
                setResultMessage(null);
                setDisabled(false);
            }
        },
        [address, disabled, balanceInEth, handleMax, resultMessage],
    );

    const sendFunds = useCallback(async (): Promise<void> => {
        setResultMessage("");
        setPending(true);

        if (!address) {
            setResultMessage(`Invalid account.`);
            setPending(false);
            return;
        }

        try {
            await topUpCallBack(value);
            setValue((currentValue) =>
                currentValue === value ? "0" : currentValue,
            );
        } catch (error) {
            // Ignore.
        }

        setPending(false);
    }, [address, topUpCallBack, value]);

    const [clickedMax, setClickedMax] = useState(false);

    const handleChangeEvent = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            handleChange(event.target.value);
        },
        [handleChange],
    );

    const [tab, setTab] = useState<string>(Tab.Add);

    const onSubmit = useMemo(
        () => (event: React.MouseEvent<HTMLFormElement, MouseEvent>) => {
            event.preventDefault();
            sendFunds();
        },
        [sendFunds],
    );

    const onClickMax = useCallback(() => {
        setClickedMax(true);
        handleMax().finally(() => setClickedMax(false));
    }, [handleMax]);

    return (
        <Block className={`gas-block`}>
            <BlockTitle>
                <h3>
                    <FlameIcon />
                    Gas Balance
                </h3>
            </BlockTitle>

            {gasValue ? (
                <div className="block--advanced">
                    <div className="block--advanced--top">
                        <>
                            <span className="gas-block--advanced--value">
                                {gasValue}
                            </span>
                            <span className="gas-block--advanced--unit">
                                ETH
                            </span>
                        </>
                    </div>
                    <div className="block--advanced--bottom">
                        <div className="topup">
                            <Tabs
                                selected={tab}
                                onTab={setTab}
                                tabs={{
                                    [Tab.Add]: (
                                        <BlockBody>
                                            <label>
                                                {resultMessage ? (
                                                    <p className="topup--input--warning warning">
                                                        {resultMessage}
                                                    </p>
                                                ) : (
                                                    <p className="topup--title">
                                                        Enter the amount of
                                                        Ether you would like to
                                                        deposit.
                                                    </p>
                                                )}
                                                <form
                                                    className="topup--form"
                                                    onSubmit={onSubmit}
                                                >
                                                    <div className="topup--input">
                                                        <input
                                                            disabled={pending}
                                                            type="text"
                                                            value={value}
                                                            min={0}
                                                            onChange={
                                                                handleChangeEvent
                                                            }
                                                            placeholder="Amount in ETH"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="topup--max"
                                                            disabled={
                                                                clickedMax
                                                            }
                                                            onClick={onClickMax}
                                                        >
                                                            MAX
                                                        </button>
                                                    </div>
                                                    {pending ? (
                                                        <button disabled>
                                                            Depositing...
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="submit"
                                                            className="topup--submit hover green"
                                                            disabled={disabled}
                                                        >
                                                            <span>Deposit</span>
                                                        </button>
                                                    )}
                                                </form>
                                            </label>
                                        </BlockBody>
                                    ),
                                    "Withdraw (CLI)": (
                                        <BlockBody>
                                            <label>
                                                <div className="topup--title">
                                                    Funds can be withdrawn
                                                    through the Darknode CLI.
                                                </div>
                                            </label>
                                        </BlockBody>
                                    ),
                                }}
                            />
                        </div>
                    </div>
                </div>
            ) : null}
        </Block>
    );
};
