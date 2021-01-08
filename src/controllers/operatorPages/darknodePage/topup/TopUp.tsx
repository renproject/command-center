import React, { useCallback, useMemo, useState } from "react";

import { Tabs } from "../../../../views/Tabs";
import { BlockBody } from "../blocks/Block";

interface Props {
    value: string;
    resultMessage: React.ReactNode;
    pending: boolean;
    disabled: boolean;
    handleChange: (value: string) => void;
    handleMax: () => Promise<void>;
    sendFunds: () => void;
}

enum Tab {
    Add = "Add",
    Withdraw = "Withdraw (CLI)",
}

export const TopUp: React.FC<Props> = ({
    value,
    resultMessage,
    pending,
    disabled,
    handleChange,
    handleMax,
    sendFunds,
}) => {
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
                                        Enter the amount of Ether you would like
                                        to deposit.
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
                                            onChange={handleChangeEvent}
                                            placeholder="Amount in ETH"
                                        />
                                        <button
                                            type="button"
                                            className="topup--max"
                                            disabled={clickedMax}
                                            onClick={onClickMax}
                                        >
                                            MAX
                                        </button>
                                    </div>
                                    {pending ? (
                                        <button disabled>Depositing...</button>
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
                                    Funds can be withdrawn through the Darknode
                                    CLI.
                                </div>
                            </label>
                        </BlockBody>
                    ),
                }}
            />
        </div>
    );
};
