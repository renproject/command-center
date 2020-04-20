import { Currency, CurrencyIcon } from "@renproject/react-components";
import { BigNumber } from "bignumber.js";
import React from "react";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { Token } from "../../../../lib/ethereum/tokens";
import { _catchBackgroundException_ } from "../../../../lib/react/errors";
import { showFundPopup, updateDarknodeDetails } from "../../../../store/network/networkActions";
import { NetworkStateContainer } from "../../../../store/networkStateContainer";
import { PopupContainer } from "../../../../store/popupStore";
import { AppDispatch } from "../../../../store/rootReducer";
import { Web3Container } from "../../../../store/web3Store";
import { TokenBalance } from "../../../common/TokenBalance";
import { TopUp } from "./TopUp";

export const CONFIRMATION_MESSAGE = "Transaction confirmed.";

const TopUpControllerClass: React.StatelessComponent<Props> = ({ darknodeID, actions }) => {
    const { setPopup } = PopupContainer.useContainer();
    const { address, web3, renNetwork } = Web3Container.useContainer();
    const { tokenPrices } = NetworkStateContainer.useContainer();

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
            traderBalance = new BigNumber(-1);
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
            _catchBackgroundException_(error, "Error in TopUpController > handleBlur");
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
                await actions.updateDarknodeDetails(web3, renNetwork, darknodeID, tokenPrices);
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
        await actions.showFundPopup(web3, address, darknodeID, value, onCancel, onDone, setPopup);
    };

    React.useEffect(() => {
        updateTraderBalance().catch((error) => {
            _catchBackgroundException_(error, "Error in TopUpController > updateTraderBalance");
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

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        showFundPopup,
        updateDarknodeDetails,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    darknodeID: string;
}

export const TopUpController = connect(mapStateToProps, mapDispatchToProps)(TopUpControllerClass);
