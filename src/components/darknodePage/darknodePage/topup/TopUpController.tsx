import { Currency, CurrencyIcon } from "@renproject/react-components";
import { BigNumber } from "bignumber.js";
import React from "react";

import { Token } from "../../../../lib/ethereum/tokens";
import { catchBackgroundException } from "../../../../lib/react/errors";
import { NetworkStateContainer } from "../../../../store/networkStateContainer";
import { Web3Container } from "../../../../store/web3Store";
import { TokenBalance } from "../../../common/TokenBalance";
import { TopUp } from "./TopUp";

export const CONFIRMATION_MESSAGE = "Transaction confirmed.";

export const TopUpController: React.StatelessComponent<Props> = ({ darknodeID }) => {
    const { address, web3 } = Web3Container.useContainer();
    const { updateDarknodeDetails, showFundPopup } = NetworkStateContainer.useContainer();

    const [value, setValue] = React.useState("");
    const [resultMessage, setResultMessage] = React.useState<React.ReactNode>(null);
    const [pending, setPending] = React.useState(false);
    const [disabled, setDisabled] = React.useState(false);
    const [accountBalance, setAccountBalance] = React.useState(new BigNumber(0));

    const handleChange = (newValue: string): void => {
        setValue(newValue);

        // If input is invalid, show an error.
        if (isNaN(parseFloat(newValue)) || parseFloat(newValue) <= 0) {
            setDisabled(true);
            setResultMessage(null);
        } else if (!address) {
            setResultMessage(<>Please connect your Web3 wallet first.</>);
        } else if (accountBalance.isLessThan(newValue)) {
            setResultMessage(<>Insufficient balance. Maximum deposit: <CurrencyIcon currency={Currency.ETH} /><TokenBalance token={Token.ETH} amount={accountBalance.times(new BigNumber(10).pow(18))} digits={3} /></>);
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
            traderBalance = new BigNumber((await web3.eth.getBalance(address)).toString())
                .div(new BigNumber(10).exponentiatedBy(18));
        }
        setAccountBalance(traderBalance);
        return traderBalance;
    };

    const handleBlur = async (): Promise<void> => {
        let traderBalance;
        try {
            traderBalance = await updateTraderBalance();
            if (traderBalance.isLessThan(value)) {
                setValue(traderBalance.toFixed());
                setDisabled(true);
            }
        } catch (error) {
            catchBackgroundException(error, "Error in TopUpController > handleBlur");
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
            if (value === value) {
                setValue("0");
            }
        };

        // tslint:disable-next-line: await-promise
        await showFundPopup(darknodeID, value, onCancel, onDone);
    };

    React.useEffect(() => {
        updateTraderBalance().catch((error) => {
            catchBackgroundException(error, "Error in TopUpController > updateTraderBalance");
        });
    }, []);

    return <TopUp
        darknodeID={darknodeID}
        value={value}
        resultMessage={resultMessage}
        pending={pending}
        disabled={disabled}
        handleChange={handleChange}
        handleBlur={handleBlur}
        sendFunds={sendFunds}
    />;

};

interface Props {
    darknodeID: string;
}
