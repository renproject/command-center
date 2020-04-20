import * as React from "react";

import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TxStatus } from "@renproject/interfaces";
import { Loading, TokenIcon } from "@renproject/react-components";
import { List } from "immutable";
import { connect, ConnectedReturnType } from "react-redux";
import { bindActionCreators } from "redux";

import { AllTokenDetails, Token } from "../../../lib/ethereum/tokens";
import { classNames } from "../../../lib/react/className";
import {
    addToWithdrawAddresses, removeFromWithdrawAddresses,
} from "../../../store/network/operatorActions";
import { NetworkStateContainer } from "../../../store/networkStateContainer";
import { AppDispatch } from "../../../store/rootReducer";
import { Web3Container } from "../../../store/web3Store";

enum Stage {
    Pending,
    Withdrawing,
    Done,
    Error,
}

const renderTxStatus = (status: TxStatus | null) => {
    switch (status) {
        case null:
            return "Submitting";
        case TxStatus.TxStatusNil:
            return "Submitting";
        case TxStatus.TxStatusConfirming:
            return "Waiting for confirmations";
        case TxStatus.TxStatusPending:
            return "Executing";
        case TxStatus.TxStatusExecuting:
            return "Executing";
        case TxStatus.TxStatusDone:
            return "Done";
        case TxStatus.TxStatusReverted:
            return "Reverted";
    }
};

const WithdrawPopupClass: React.StatelessComponent<Props> = ({ token, status, withdraw, onDone, onCancel, actions }) => {
    const { renNetwork } = Web3Container.useContainer();
    const { withdrawAddresses } = NetworkStateContainer.useContainer();

    const [error, setError] = React.useState(null as string | null);
    const [stage, setStage] = React.useState(Stage.Pending);
    const [selectedAddress, setSelectedAddress] = React.useState(null as string | null);
    const [newAddress, setNewAddress] = React.useState(null as string | null);
    const [newAddressValid, setNewAddressValid] = React.useState(false);

    const addNewAddress = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (newAddress) {
            actions.addToWithdrawAddresses({ token, address: newAddress });
            setSelectedAddress(newAddress);
            setNewAddress(null);
            setNewAddressValid(false);
        }
    };

    const removeAddress = (event: React.FormEvent<HTMLButtonElement>): void => {
        const element = (event.currentTarget as HTMLButtonElement);
        if (selectedAddress === element.value) {
            setSelectedAddress(null);
        }
        actions.removeFromWithdrawAddresses({ token, address: element.value });
    };

    const handleSelectAddress = (event: React.FormEvent<HTMLInputElement | HTMLButtonElement>): string => {
        const element = (event.target as (HTMLInputElement | HTMLButtonElement));
        setSelectedAddress(element.value);
        return element.value;
    };

    const handleAddressInput = (event: React.FormEvent<HTMLInputElement | HTMLButtonElement>) => {
        const element = (event.target as (HTMLInputElement | HTMLButtonElement));
        const address = element.value;


        setSelectedAddress(null);
        setNewAddress(address);

        const tokenDetails = AllTokenDetails.get(token);
        if (!tokenDetails) {
            return;
        }
        setNewAddressValid(tokenDetails.validator(address, renNetwork.networkID !== 1));
    };

    const callWithdraw = async () => {
        if (!selectedAddress) {
            setError("No address selected. ");
            return;
        }

        setStage(Stage.Withdrawing);
        setError(null);

        try {
            await withdraw(selectedAddress);
            setStage(Stage.Done);
        } catch (error) {
            setStage(Stage.Error);
            setError(error.message || String(error));
        }
    };

    const renderButtons = () => {
        // eslint-disable-next-line
        switch (stage) {
            case Stage.Pending:
                return <div className="popup--buttons">
                    <button className="sign--button button--white" onClick={onCancel}>Cancel</button>
                    <button className="sign--button button" disabled={selectedAddress === null} onClick={callWithdraw}>Submit</button>
                </div>;
            case Stage.Withdrawing:
                return <div className="popup--buttons">
                    <Loading />
                </div>;
            case Stage.Done:
                return <div className="popup--buttons">
                    <button className="sign--button button" onClick={onDone}>Close</button>
                </div>;
            case Stage.Error:
                return <>
                    {error ? <p className="red popup--error">{error}</p> : null}
                    <div className="popup--buttons">
                        <button className="sign--button button--white" onClick={onCancel}>Cancel</button>
                        <button className="sign--button button--white" disabled={selectedAddress === null} onClick={callWithdraw}>Retry</button>
                    </div>
                </>;
        }
    };

    return <div className="popup withdraw">
        <h2>Select <TokenIcon token={token} /> {token} withdraw address</h2>
        {stage === Stage.Pending || stage === Stage.Error ?
            <>
                <div className="withdraw--addresses">
                    {withdrawAddresses.get(token, List<string>()).map((withdrawAddress: string) => {
                        return <div key={withdrawAddress} className={classNames("withdraw--address--outer", selectedAddress === withdrawAddress ? `withdraw--selected` : "")}>
                            <button
                                onClick={handleSelectAddress}
                                value={withdrawAddress}
                                className={`monospace withdraw--address`}
                            >
                                {withdrawAddress}
                            </button>
                            <button value={withdrawAddress} onClick={removeAddress} className="withdraw--address--remove">
                                <FontAwesomeIcon icon={faTimes} pull="right" />
                            </button>
                        </div>;
                    }).toArray()}
                </div>
                <form onSubmit={addNewAddress}>
                    <div className={`new-address--outer ${newAddressValid ? "input--valid" : ""}`}>
                        <input
                            type="text"
                            placeholder="New address"
                            value={newAddress || ""}
                            className="new-address"
                            onChange={handleAddressInput}
                        />
                        <button type="submit" title={newAddressValid ? "Add address" : `Invalid ${token} address`} disabled={!newAddressValid} className={["new-address--plus", newAddressValid ? "new-address--plus--green" : "new-address--plus--red"].join(" ")}>
                            <FontAwesomeIcon icon={faPlus} pull="right" />
                        </button>
                    </div>
                </form>
            </> : <>
                {status === TxStatus.TxStatusConfirming || status === TxStatus.TxStatusExecuting || status === TxStatus.TxStatusPending || status === TxStatus.TxStatusDone ? <>
                    The withdrawal has been submitted to RenVM. Your funds will be available shortly.<br />
                    Status: {renderTxStatus(status)}
                </> : <></>}
            </>}
        {renderButtons()}
    </div>;
};

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        addToWithdrawAddresses,
        removeFromWithdrawAddresses,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    token: Token;
    status: TxStatus;
    withdraw(address: string): Promise<void>;
    onDone(): void;
    onCancel(): void;
}

export const WithdrawPopup = connect(mapStateToProps, mapDispatchToProps)(WithdrawPopupClass);
