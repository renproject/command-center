import { Loading } from "@renproject/react-components";
import React, { useState } from "react";

import { TokenString } from "../../../lib/ethereum/tokens";

enum Stage {
    WithdrawingToken,
    DoneToken,
    Error,
}

const ColoredBanner: React.FC<{ token: TokenString }> = ({ token }) => {
    return (
        <div
            className={`colored-banner colored-banner--${token.toLowerCase()}`}
        />
    );
};

export const WithdrawPopup: React.FC<Props> = ({
    token,
    withdraw,
    onDone,
    onCancel,
}) => {    
    const [error, setError] = useState(null as string | null);
    const [stage, setStage] = useState(Stage.WithdrawingToken);
    
    const callWithdrawToken = async () => {
        setStage(Stage.WithdrawingToken);
        setError(null);

        try {
            await withdraw("", { asERC20: true });
            setStage(Stage.DoneToken);
        } catch (error) {
            console.error(error);
            setStage(Stage.Error);
            setError(error.message || String(error));
        }
    };

    React.useEffect(() => {
        callWithdrawToken();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const renderButtons = () => {
        // eslint-disable-next-line
        switch (stage) {
            case Stage.WithdrawingToken:
                return (
                    <div className="popup--buttons">
                        {/* <Loading alt={true} /> */}
                    </div>
                );
            case Stage.DoneToken:
                return (
                    <div className="popup--buttons">
                        <button
                            className="sign--button button"
                            onClick={onDone}
                        >
                            Close
                        </button>
                    </div>
                );
            case Stage.Error:
                return (
                    <>
                        <div className="popup--buttons">
                            <button
                                className="sign--button button--white"
                                onClick={onCancel}
                            >
                                Cancel
                            </button>
                            <button
                                className="sign--button button--white"
                                onClick={callWithdrawToken}
                            >
                                Retry
                            </button>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="popup withdraw">
            <ColoredBanner token={token} />
            <div className="popup--body">
                <div className="popup--top">
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <h3>Withdraw {token} tokens</h3>
                        {stage === Stage.Error ? (
                            <button
                                className="withdraw--as-token-link"
                                onClick={callWithdrawToken}
                            >
                                Withdraw {token}
                            </button>
                        ) : null}
                    </div>
                    <h2>
                        {stage === Stage.WithdrawingToken || stage === Stage.Error ? (
                            <>Withdrawing {token}</>
                        ) : stage === Stage.DoneToken ? (
                            <>{token} withdrawn</>
                        ) : (
                            <>
                                Enter your{" "}
                                {token}{" "}
                                withdraw address
                            </>
                        )}
                    </h2>
                    {stage === Stage.Error ? (
                        <>
                            {error ? (
                                <p className="red popup--error">{error}</p>
                            ) : null}
                        </>
                    ) : null}
                    {stage === Stage.WithdrawingToken ? (
                        <div className="withdraw--loading">
                            <p>Waiting for Ethereum transaction</p>
                            <Loading alt={true} />
                        </div>
                    ) : null}
                    {stage === Stage.DoneToken ? (
                        <div className="withdraw--loading">
                            <p>{token} withdrawn to your Ethereum wallet.</p>
                        </div>
                    ) : null}
                </div>
                <div className="popup--bottom">
                    {renderButtons()}
                </div>
            </div>
        </div>
    );
};

interface Props {
    token: TokenString;
    withdraw(address: string, options?: { asERC20: boolean }): Promise<void>;
    onDone(): void;
    onCancel(): void;
}
