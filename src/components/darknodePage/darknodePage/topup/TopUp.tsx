import * as React from "react";

import { Tabs } from "../../../common/Tabs";
import { BlockBody } from "../block/Block";
import { CONFIRMATION_MESSAGE } from "./TopUpController";

interface Props {
    darknodeID: string;
    value: string;
    resultMessage: React.ReactNode;
    pending: boolean;
    disabled: boolean;
    handleChange: (value: string) => void;
    handleBlur: () => void;
    sendFunds: () => void;
}

export const TopUp = (props: Props) => {
    const { value, resultMessage, pending, disabled, handleChange, handleBlur, sendFunds } = props;

    const handleChangeEvent = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(event.target.value);
    }, [handleChange]);

    return <div className="topup">
        <Tabs
            tabs={{
                Add: <BlockBody>
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
