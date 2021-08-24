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
                                A gas balance is no longer needed to claim and
                                withdraw darknode rewards, so deposit is no
                                longer necessary.
                            </p>
                            <p className="topup--title">
                                You can withdraw your funds using the Darknode
                                CLI.
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}
        </Block>
    );
};
