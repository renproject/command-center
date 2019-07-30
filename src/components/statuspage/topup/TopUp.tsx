import * as React from "react";

import { CONFIRMATION_MESSAGE } from "./TopUpController";

interface Props {
    darknodeID: string;
    value: string;
    resultMessage: string | null;
    pending: boolean;
    disabled: boolean;
    handleChange: (value: string) => void;
    handleBlur: () => void;
    sendFunds: () => void;
}

export const TopUp = (props: Props) => {
    const { value, resultMessage, pending, disabled, handleChange, handleBlur, sendFunds } = props;

    const handleChangeEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(event.target.value);
    };

    return <div className="topup">
        <label>
            <div className="topup--title">Enter the amount of Ether you would like to deposit</div>
            <p className="topup--withdraw">Funds can be withdrawn through the Darknode CLI.</p>
            <span className="topup--input">
                <input
                    disabled={pending}
                    type="number"
                    value={value}
                    min={0}
                    onChange={handleChangeEvent}
                    onBlur={handleBlur}
                />
                {pending ?
                    <button disabled>Depositing...</button> :
                    <button className="hover green" onClick={sendFunds} disabled={disabled}>
                        <span>Deposit</span>
                    </button>
                }
            </span>
        </label>
        {resultMessage &&
            <p
                className={`${resultMessage === CONFIRMATION_MESSAGE ? "topup--input--success success" :
                    "topup--input--warning warning"}`}
            >
                {resultMessage}
            </p>
        }
    </div>;
};
