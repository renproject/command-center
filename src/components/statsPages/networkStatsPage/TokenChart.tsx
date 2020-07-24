import { Currency, CurrencyIcon, Loading, TokenIcon } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React from "react";
import { Doughnut } from "react-chartjs-2";

import { QuotePeriodResponse } from "../../../lib/graphQL/volumes";
import { textCurrencyIcon } from "./HistoryChart";

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

    return <div className="overview--chart--outer" style={{ maxWidth: "calc(100vw - 80px)" }}>
        <div className="overview--chart">
            {periodSeries ? <><div className="overview--chart--canvas" style={{ maxWidth: "calc(100vw - 80px)" }}>
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
                    options={{
                        tooltips: {
                            callbacks: {
                                // tslint:disable-next-line: no-any
                                title: (tooltipItem: any, data: any) => {
                                    return (graphType === "Volume" ? "Volume - " : "Value minted - ") + data.labels[tooltipItem[0].index];
                                },
                                // tslint:disable-next-line: no-any
                                label: (tooltipItem: any, data: any) => {
                                    const dataset = data.datasets[0];
                                    const percent = dataset._meta[0] ? Math.round((dataset.data[tooltipItem.index] / dataset._meta[0].total) * 100) : undefined;
                                    return `${textCurrencyIcon(quoteCurrency)}${new BigNumber(data.datasets[0].data[tooltipItem.index]).toFormat()} ${quoteCurrency.toUpperCase()}${percent !== undefined ? ` - ${percent}%` : ""}`;
                                },
                                // // tslint:disable-next-line: no-any
                                // afterLabel: (tooltipItem: any, data: any) => {
                                //     const dataset = data.datasets[0];
                                //     const percent = Math.round((dataset.data[tooltipItem.index] / dataset._meta[0].total) * 100);
                                //     return percent + "%";
                                // }
                            },
                            backgroundColor: "#00050B",
                            borderWidth: 0,
                            titleFontSize: 14,
                            titleFontColor: "#fff",
                            bodyFontColor: "#fff",
                            bodyFontSize: 14,
                            displayColors: false,
                            xPadding: 10,
                            yPadding: 10,
                        }
                    }
                    }
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
                                    {new BigNumber(periodSeries.average[`quote${graphType === "Locked" ? "Total" : "Period"}${graphType}${token}`]).toFormat()}
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
