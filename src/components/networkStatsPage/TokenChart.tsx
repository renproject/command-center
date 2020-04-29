import { Currency, CurrencyIcon, Loading, TokenIcon } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import React from "react";
import { Doughnut } from "react-chartjs-2";

import { Token } from "../../lib/ethereum/tokens";
import { QuotePeriodResponse } from "../../lib/graphQL/volumes";
import { TokenBalance } from "../common/TokenBalance";

const colors = [
    "#004CA0",
    // "#005EC4",
    "#006FE8",
    // "#002A58",
    "#003B7C",
];

interface Props {
    periodSeries: QuotePeriodResponse | null | undefined;
    quoteCurrency: Currency;
    graphType: "Volume" | "Locked";
}

export const TokenChart: React.FunctionComponent<Props> = ({ periodSeries, quoteCurrency, graphType }) => {
    const tokens = ["BTC", "ZEC", "BCH"];

    return <div className="overview--chart--outer">
        <div className="overview--chart">
            {periodSeries ? <><div className="overview--chart--canvas">
                <Doughnut
                    height={186}
                    width={186}
                    legend={{ display: false }}
                    data={{
                        maintainAspectRation: true,
                        labels: tokens,
                        datasets: [{
                            data: tokens.map(token => periodSeries.average[`quote${graphType === "Locked" ? "Total" : "Period"}${graphType}${token}`]),
                            backgroundColor: colors,
                            borderColor: "#001A38",
                            maintainAspectRation: true,
                            // hoverBackgroundColor: [],
                        }]
                    }}
                />
            </div>
                <div className="overview--chart--legend">
                    <div className="overview--chart--legend--table">
                        {periodSeries ? tokens.map((token) => {
                            return <div key={token}>
                                <div>
                                    <TokenIcon token={token} white={true} /><span>{token}</span>
                                </div>
                                <div>
                                    <CurrencyIcon currency={quoteCurrency} />
                                    {/* <TokenBalance */}
                                    {/* token={Token.ETH} */}
                                    {periodSeries.average[`quote${graphType === "Locked" ? "Total" : "Period"}${graphType}${token}`]}
                                    {/* convertTo={quoteCurrency} */}
                                    {/* /> */}
                                </div>
                            </div>;
                        }) : <></>}
                    </div>
                </div>
            </> : <Loading alt />}
        </div>
    </div>;
};
