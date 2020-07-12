import React, { useCallback, useState } from "react";

import { Tabs } from "../../../../views/Tabs";
import { BlockBody } from "../blocks/Block";
import { CONFIRMATION_MESSAGE } from "./TopUpController";

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

export const TopUp: React.FC<Props> = ({ value, resultMessage, pending, disabled, handleChange, handleBlur, sendFunds }) => {
    const handleChangeEvent = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(event.target.value);
    }, [handleChange]);

    const [tab, setTab] = useState<string>(Tab.Add);

    return <div className="topup">
        <Tabs
            selected={tab}
            onTab={setTab}
            tabs={{
                [Tab.Add]: <BlockBody>
                    <label>
                        {resultMessage ?
                            <p
                                className={`${resultMessage === CONFIRMATION_MESSAGE ? "topup--input--success success" :
                                    "topup--input--warning warning"}`}
                            >
                                {resultMessage}
                            </p> :
                            <p className="topup--title">Enter the amount of Ether you would like to deposit.</p>
                        }
                        <span className="topup--input">
                            <input
                                disabled={pending}
                                type="number"
                                value={value}
                                min={0}
                                onChange={handleChangeEvent}
                                onBlur={handleBlur}
                                placeholder="Amount in ETH"
                            />
                            {pending ?
                                <button disabled>Depositing...</button> :
                                <button className="hover green" onClick={sendFunds} disabled={disabled}>
                                    <span>Deposit</span>
                                </button>
                            }
                        </span>
                    </label>
                </BlockBody>,
                "Withdraw (CLI)": <BlockBody><label>
                    <div className="topup--title">Funds can be withdrawn through the Darknode CLI.</div>
                </label></BlockBody>,
            }}
        />
    </div>;
};
