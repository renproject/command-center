import React, { useCallback, useMemo, useState } from "react";

import { Tabs } from "../../../../views/Tabs";
import { BlockBody } from "../blocks/Block";

interface Props {
    value: string;
    resultMessage: React.ReactNode;
    pending: boolean;
    disabled: boolean;
    handleChange: (value: string) => void;
    handleBlur: () => void;
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
    handleBlur,
    sendFunds,
}) => {
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
                                    className="topup--input"
                                    onSubmit={onSubmit}
                                >
                                    <input
                                        disabled={pending}
                                        type="text"
                                        value={value}
                                        min={0}
                                        onChange={handleChangeEvent}
                                        onBlur={handleBlur}
                                        placeholder="Amount in ETH"
                                    />
                                    {pending ? (
                                        <button disabled>Depositing...</button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="hover green"
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
