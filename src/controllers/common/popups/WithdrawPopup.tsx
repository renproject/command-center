import { faCopy, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { Loading } from "@renproject/react-components";
import { List } from "immutable";
import React, { useState } from "react";

import { copyToClipboard } from "../../../lib/copyToClipboard";
import { AllTokenDetails, Token } from "../../../lib/ethereum/tokens";
import { classNames } from "../../../lib/react/className";
import { NetworkContainer } from "../../../store/networkContainer";
import { Web3Container } from "../../../store/web3Container";
import { ReactComponent as CheckImage } from "../../../styles/images/check.svg";

enum Stage {
    Pending,
    Withdrawing,
    Done,
    Error,
}

const ColoredBanner: React.FC<{ token: Token }> = ({ token }) => {
    return <div className={`colored-banner colored-banner--${token.toLowerCase()}`} />;
};

export const WithdrawPopup: React.FC<Props> = ({ token, withdraw, onDone, onCancel }) => {
    const { renNetwork } = Web3Container.useContainer();
    const { withdrawAddresses, addToWithdrawAddresses, removeFromWithdrawAddresses } = NetworkContainer.useContainer();

    const [error, setError] = useState(null as string | null);
    const [stage, setStage] = useState(Stage.Pending);
    const [selectedAddress, setSelectedAddress] = useState(null as string | null);
    const [newAddress, setNewAddress] = useState(null as string | null);
    const [newAddressValid, setNewAddressValid] = useState(false);

    const tokenDetails = AllTokenDetails.get(token);

    const addNewAddress = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (newAddress) {
            addToWithdrawAddresses(token, newAddress);
            setSelectedAddress(newAddress);
            setNewAddress(null);
            setNewAddressValid(false);
        }
    };

    const removeAddress = (event: React.FormEvent<HTMLButtonElement>): void => {
        const element = (event.currentTarget as HTMLButtonElement);
        if (selectedAddress === element.value) {
            setSelectedAddress(null);
        } else {
            removeFromWithdrawAddresses(token, element.value);
        }
    };

    const handleSelectAddress = (event: React.FormEvent<HTMLInputElement | HTMLButtonElement>) => {
        const element = (event.target as (HTMLInputElement | HTMLButtonElement));
        if (selectedAddress === element.value) {
            setSelectedAddress(null);
        } else {
            setSelectedAddress(element.value);
        }
    };

    const handleAddressInput = (event: React.FormEvent<HTMLInputElement | HTMLButtonElement>) => {
        const element = (event.target as (HTMLInputElement | HTMLButtonElement));
        const address = element.value;


        setSelectedAddress(null);
        setNewAddress(address);

        if (!tokenDetails) {
            return;
        }
        setNewAddressValid(tokenDetails.validator(address, renNetwork.networkID !== 1));
    };

    const callWithdraw = async () => {
        if (!selectedAddress && (!newAddressValid || !newAddress)) {
            setError("No address selected.");
            return;
        }

        setStage(Stage.Withdrawing);
        setError(null);

        const address = selectedAddress || newAddress || "";

        try {
            if (newAddress) {
                addToWithdrawAddresses(token, address);
                setSelectedAddress(address);
                setNewAddress(null);
                setNewAddressValid(false);
            }
            await withdraw(address);
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
                    <button className="sign--button button" disabled={selectedAddress === null && !newAddressValid} onClick={callWithdraw}>Submit</button>
                </div>;
            case Stage.Withdrawing:
                return <div className="popup--buttons">
                    {/* <Loading alt={true} /> */}
                </div>;
            case Stage.Done:
                return <div className="popup--buttons">
                    <button className="sign--button button" onClick={onDone}>Close</button>
                </div>;
            case Stage.Error:
                return <>
                    <div className="popup--buttons">
                        <button className="sign--button button--white" onClick={onCancel}>Cancel</button>
                        <button className="sign--button button--white" disabled={selectedAddress === null && !newAddressValid} onClick={callWithdraw}>Retry</button>
                    </div>
                </>;
        }
    };

    const onClickCopy = (e: React.MouseEvent<HTMLElement>): void => {
        const el = e.currentTarget as Element;
        copyToClipboard(el);
    };

    return <div className="popup withdraw">
        <ColoredBanner token={token} />
        <div className="popup--body">
            <div className="popup--top">
                {stage === Stage.Error ? <>
                    {error ? <p className="red popup--error">{error}</p> : null}
                </> : <>
                        <h3>Withdraw {token} tokens</h3>
                        <h2>{stage === Stage.Withdrawing ? <>Withdrawing {token}</> :
                            stage === Stage.Done ? <>{token} withdrawn</> :
                                <>Enter your {tokenDetails ? tokenDetails.name : token} withdraw address</>}
                        </h2>
                    </>}
                {stage === Stage.Pending || stage === Stage.Error ?
                    <>
                        <div className={`withdraw--addresses ${withdrawAddresses.size === 0 ? "withdraw--addresses--empty" : ""}`}>
                            {withdrawAddresses.get(token, List<string>()).map((withdrawAddress: string) => {
                                return <div key={withdrawAddress} className={classNames("withdraw--address--outer", selectedAddress === withdrawAddress ? `withdraw--selected` : "")}>
                                    <button
                                        onClick={handleSelectAddress}
                                        value={withdrawAddress}
                                        className={`monospace withdraw--address`}
                                    >
                                        {withdrawAddress}
                                    </button>
                                    <button onClick={onClickCopy} data-addr={withdrawAddress} className="withdraw--address--remove">
                                        <FontAwesomeIcon icon={faCopy as FontAwesomeIconProps["icon"]} pull="right" />
                                    </button>
                                    <button value={withdrawAddress} onClick={removeAddress} className="withdraw--address--remove">
                                        <FontAwesomeIcon icon={faTimes as FontAwesomeIconProps["icon"]} pull="right" />
                                    </button>
                                </div>;
                            }).toArray()}
                        </div>
                    </> : null}
                {stage === Stage.Withdrawing ? <div className="withdraw--loading">
                    <p>Waiting for two Ethereum transactions</p>
                    <Loading alt={true} />
                </div> : null}
                {stage === Stage.Done ? <div className="withdraw--loading">
                    <p>{token} withdrawn. It will be deposited to your address after 30 Ethereum confirmations.</p>
                </div> : null}
            </div>
            <div className="popup--bottom">
                {stage === Stage.Pending || stage === Stage.Error ?
                    <form onSubmit={addNewAddress}>
                        <div className={`new-address--outer ${newAddressValid ? "input--valid" : ""}`}>
                            <input
                                type="text"
                                placeholder="New address"
                                value={newAddress || ""}
                                className={`new-address ${selectedAddress ? "new-address--faded" : ""}`}
                                onChange={handleAddressInput}
                            />
                            <label className="input-label"><span>{tokenDetails ? tokenDetails.name : token} address</span></label>
                            {newAddressValid ? <CheckImage className="new-address--check" /> : null}
                        </div>
                        <p className="new-address--description">This address is where you will receive your rewards.</p>
                    </form> : null}
                {renderButtons()}
            </div>
        </div>
    </div>;
};

interface Props {
    token: Token;
    withdraw(address: string): Promise<void>;
    onDone(): void;
    onCancel(): void;
}
