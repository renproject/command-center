import { Currency, CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import React from "react";
import { Token } from "../../../lib/ethereum/tokens";

import { TokenAmount } from "../../../lib/graphQL/queries/queries";
import { ReactComponent as RewardsIcon } from "../../../styles/images/icon-rewards-white.svg";
import { Stat } from "../../../views/Stat";
import { TokenIcon } from "../../../views/tokenIcon/TokenIcon";
import { AnyTokenBalance, ConvertCurrency } from "../../common/TokenBalance";

interface Props {
    fees: OrderedMap<string, TokenAmount | null> | null | undefined;
    feesInUsd: BigNumber | null | undefined;

    message: string;
    infoLabel: string;
    quoteCurrency: Currency;
}

export const FeesStat: React.FC<Props> = ({
    fees,
    feesInUsd,
    message,
    infoLabel,
    quoteCurrency,
}) => (
    <Stat
        className="network-fees-stat"
        message={message}
        dark={true}
        big={true}
        style={{ flexBasis: "0", flexGrow: 5 }}
        icon={<RewardsIcon />}
        infoLabel={infoLabel}
    >
        {fees && feesInUsd ? (
            <>
                <span>
                    <CurrencyIcon currency={quoteCurrency} />
                    {quoteCurrency === Currency.BTC ? (
                        <AnyTokenBalance
                            amount={
                                (
                                    fees.get(Token.BTC) || {
                                        amount: new BigNumber(0),
                                    }
                                ).amount
                            }
                            decimals={8}
                        />
                    ) : (
                        <ConvertCurrency
                            from={Currency.USD}
                            to={quoteCurrency}
                            amount={feesInUsd}
                        />
                    )}
                </span>
                <div className="network-fees">
                    {fees
                        .filter(
                            (reward) =>
                                reward && reward.asset && reward.amount.gt(0),
                        )
                        .sortBy((reward) =>
                            reward ? reward.amountInUsd.toNumber() : 0,
                        )
                        .reverse()
                        .map((reward, symbol) =>
                            reward ? (
                                <div key={symbol}>
                                    <TokenIcon
                                        white={true}
                                        token={symbol.replace(/^ren/, "")}
                                    />
                                    <AnyTokenBalance
                                        amount={reward.amount}
                                        decimals={
                                            reward.asset
                                                ? reward.asset.decimals
                                                : 0
                                        }
                                    />{" "}
                                    {symbol}
                                </div>
                            ) : null,
                        )
                        .valueSeq()
                        .toArray()}
                </div>
            </>
        ) : (
            <Loading alt />
        )}
    </Stat>
);
