import { Currency, CurrencyIcon, Loading, TokenIcon } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import React from "react";
import { Doughnut } from "react-chartjs-2";

import { Token } from "../../lib/ethereum/tokens";
import { TokenBalance } from "../common/TokenBalance";

const colors = [
    "#004CA0",
    "#005EC4",
    "#006FE8",
    "#002A58",
    "#003B7C",
];

export const RewardChart: React.FunctionComponent<{ values: OrderedMap<Token, BigNumber> | null, quoteCurrency: Currency }> = ({ values, quoteCurrency }) => {
    return <div className="overview--chart--outer">
        <div className="overview--chart">
            {values ? <><div className="overview--chart--canvas">
                <Doughnut
                    height={186}
                    width={186}
                    legend={{ display: false }}
                    data={{
                        maintainAspectRation: true,
                        labels: values.size === 0 ? ["No rewards for cycle yet"] : values.keySeq().toArray(),
                        datasets: [{
                            data: values.size === 0 ? [100] : values.valueSeq().toArray(),
                            backgroundColor: values.size === 0 ? ["#00000000"] : colors,
                            borderColor: "#001A38",
                            maintainAspectRation: true,
                            // hoverBackgroundColor: [],
                        }]
                    }}
                />
            </div>
                <div className="overview--chart--legend">
                    <div className="overview--chart--legend--table">
                        {values ? values.slice(0, 3).toArray().map(([token, value], i) => {
                            return <div key={token}>
                                <div>
                                    <TokenIcon token={token} white={true} /><span>{token}</span>
                                </div>
                                <div>
                                    <CurrencyIcon currency={quoteCurrency} />
                                    <TokenBalance
                                        token={Token.ETH}
                                        amount={value}
                                        convertTo={quoteCurrency}
                                    />
                                </div>
                            </div>;
                        }) : <></>}
                    </div>
                </div>
            </> : <Loading alt />}
        </div>
    </div>;
};
