import { Currency, Loading, naturalTime } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React from "react";
import { Line } from "react-chartjs-2";

import { QuotePeriodResponse } from "../../lib/graphQL/volumes";

// This will be included in the next @renproject/react-components version.
export const textCurrencyIcon = (currency: Currency) => {
    // Note: Typescript will warn if the switch statement is non-exhaustive

    // tslint:disable-next-line: switch-default
    switch (currency) {
        case Currency.AUD:
            return "$";
        case Currency.CNY:
            return "¥";
        case Currency.GBP:
            return "£";
        case Currency.EUR:
            return "€";
        case Currency.JPY:
            return "¥";
        case Currency.KRW:
            return "₩";
        case Currency.RUB:
            return "₽";
        case Currency.USD:
            return "$";
        default:
            return "";
    }
};

interface Props {
    periodSeries: QuotePeriodResponse | null | undefined;
    graphType: "TotalVolume" | "TotalLocked";
    quoteCurrency: Currency;
}

export const HistoryChart: React.FC<Props> = ({ periodSeries, graphType, quoteCurrency }) => {

    const cachedSeries = periodSeries && periodSeries.historic;

    return <div className="overview--chart--outer" style={{ maxWidth: "calc(100vw - 80px)" }}>
        <div className="volume--chart">
            {cachedSeries ? <><div className="overview--chart--canvas" style={{ maxWidth: "calc(100vw - 80px)" }}>
                <Line
                    // <Bar
                    height={330}
                    width={400}
                    legend={{ display: false }}
                    // tslint:disable-next-line: react-this-binding-issue jsx-no-lambda no-any
                    data={(canvas: any) => {
                        const ctx = canvas.getContext("2d");
                        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                        gradient.addColorStop(0, "#006FE8");
                        gradient.addColorStop(1, "#074487");

                        return {
                            maintainAspectRation: true,
                            labels: cachedSeries.map(item => naturalTime(item.date, {
                                suffix: "ago",
                                message: "current",
                                countDown: false,
                                showingSeconds: false
                            })),
                            datasets: [{
                                data: cachedSeries.map(item => item[`quote${graphType}`]),
                                borderColor: "#006FE8",
                                lineTension: 0.3,
                                backgroundColor: "rgba(75,192,192,0.0)",
                                borderCapStyle: "butt",
                                borderDash: [],
                                borderDashOffset: 0.0,
                                borderJoinStyle: "miter",
                                pointBorderColor: "#006FE8",
                                pointBackgroundColor: "#006FE8",
                                pointBorderWidth: 0,
                                pointHoverRadius: 5,
                                pointHoverBackgroundColor: "#001732",
                                pointHoverBorderColor: "#006FE8",
                                pointHoverBorderWidth: 2,
                                pointRadius: 1,
                                pointHitRadius: 10,
                                bezierCurve: true,
                            }],
                        };
                    }}
                    options={{
                        cornerRadius: 20,
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    display: false
                                },
                                offset: false,
                                radius: 25,
                            }],
                            xAxes: [{
                                ticks: {
                                    fontColor: "#969696",
                                    fontSize: 9,
                                },
                                barThickness: 13
                            }],
                        },
                        tooltips: {
                            callbacks: {
                                // tslint:disable-next-line: no-any
                                title: (tooltipItem: any, data: any) => {
                                    return (graphType === "TotalVolume" ? "Volume - " : "Value locked - ") + data.labels[tooltipItem[0].index];
                                },
                                // tslint:disable-next-line: no-any
                                label: (tooltipItem: any, data: any) => {
                                    return `${textCurrencyIcon(quoteCurrency)}${new BigNumber(data.datasets[0].data[tooltipItem.index]).toFormat()} ${quoteCurrency.toUpperCase()}`;
                                },
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
                    }}
                />
            </div>
            </> : <Loading alt />}
        </div>
    </div>;
};
