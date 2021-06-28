import BigNumber from "bignumber.js";
import React, { useMemo } from "react";
import { ReactComponent as FlameIcon } from "../../styles/images/icon-flame.svg";

import { Block, BlockTitle } from "./Block";

interface Props {
    darknodeBalance: BigNumber | null;
    loggedIn: boolean;
    userBalance: BigNumber | null;
    maxCallback?: () => Promise<BigNumber>;
    topUpCallBack: (value: string) => Promise<void>;
}

export const GasBlock: React.FC<Props> = ({ darknodeBalance }) => {
    const darknodeBalanceString = useMemo(
        () =>
            darknodeBalance
                ? darknodeBalance
                      .div(new BigNumber(Math.pow(10, 18)))
                      .toFixed(3)
                : null,
        [darknodeBalance],
    );

    return (
        <Block className={`gas-block`}>
            <BlockTitle>
                <h3>
                    <FlameIcon />
                    Gas Balance
                </h3>
            </BlockTitle>

            {darknodeBalanceString ? (
                <div className="block--advanced">
                    <div className="block--advanced--top">
                        <>
                            <span className="gas-block--advanced--value">
                                {darknodeBalanceString}
                            </span>
                            <span className="gas-block--advanced--unit">
                                ETH
                            </span>
                        </>
                    </div>
                    <div className="block--advanced--bottom">
                        <div className="topup">
                            <p className="topup--title">
                                Your Darknode no longer needs ETH to operate.
                                You can withdraw your funds using the Darknode
                                CLI.
                            </p>
                            <div className="topup--form">
                                <div className="topup--input">
                                    <input
                                        type="text"
                                        disabled
                                        min={0}
                                        placeholder="Amount in ETH"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="topup--submit hover green"
                                    disabled
                                >
                                    <span>Deposit</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </Block>
    );
};
