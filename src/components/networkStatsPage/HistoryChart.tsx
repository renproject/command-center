import { Currency, Loading, naturalTime } from "@renproject/react-components";
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

// import { Bar } from "react-chartjs-2";
import { QuotePeriodData, QuotePeriodResponse } from "../../lib/graphQL/volumes";

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


// const { Chart } = require("react-chartjs-2");
// require("chartjs-plugin-style");

// /*
// *   Rounded Rectangle Extension for Bar Charts and Horizontal Bar Charts
// *   Tested with Charts.js 2.7.0
// */
// Chart.elements.Rectangle.prototype.draw = function () {

//     const ctx = this._chart.ctx;
//     const vm = this._view;
//     let left, right, top, bottom, signX, signY, borderSkipped;
//     let borderWidth = vm.borderWidth;

//     // If radius is less than 0 or is large enough to cause drawing errors a max
//     //      radius is imposed. If cornerRadius is not defined set it to 0.
//     let cornerRadius = this._chart.config.options.cornerRadius;
//     if (cornerRadius < 0) { cornerRadius = 0; }
//     if (cornerRadius === undefined) { cornerRadius = 0; }

//     if (!vm.horizontal) {
//         // bar
//         left = vm.x - vm.width / 2;
//         right = vm.x + vm.width / 2;
//         top = vm.y;
//         bottom = vm.base;
//         signX = 1;
//         signY = bottom > top ? 1 : -1;
//         borderSkipped = vm.borderSkipped || "bottom";
//     } else {
//         // horizontal bar
//         left = vm.base;
//         right = vm.x;
//         top = vm.y - vm.height / 2;
//         bottom = vm.y + vm.height / 2;
//         signX = right > left ? 1 : -1;
//         signY = 1;
//         borderSkipped = vm.borderSkipped || "left";
//     }

//     // Canvas doesn't allow us to stroke inside the width so we can
//     // adjust the sizes to fit if we're setting a stroke on the line
//     if (borderWidth) {
//         // borderWidth shold be less than bar width and bar height.
//         const barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
//         borderWidth = borderWidth > barSize ? barSize : borderWidth;
//         const halfStroke = borderWidth / 2;
//         // Adjust borderWidth when bar top position is near vm.base(zero).
//         const borderLeft = left + (borderSkipped !== "left" ? halfStroke * signX : 0);
//         const borderRight = right + (borderSkipped !== "right" ? -halfStroke * signX : 0);
//         const borderTop = top + (borderSkipped !== "top" ? halfStroke * signY : 0);
//         const borderBottom = bottom + (borderSkipped !== "bottom" ? -halfStroke * signY : 0);
//         // not become a vertical line?
//         if (borderLeft !== borderRight) {
//             top = borderTop;
//             bottom = borderBottom;
//         }
//         // not become a horizontal line?
//         if (borderTop !== borderBottom) {
//             left = borderLeft;
//             right = borderRight;
//         }
//     }

//     ctx.beginPath();
//     ctx.fillStyle = vm.backgroundColor;
//     ctx.strokeStyle = vm.borderColor;
//     ctx.lineWidth = borderWidth;

//     // Corner points, from bottom-left to bottom-right clockwise
//     // | 1 2 |
//     // | 0 3 |
//     const corners = [
//         [left, bottom],
//         [left, top],
//         [right, top],
//         [right, bottom]
//     ];

//     // Find first (starting) corner with fallback to 'bottom'
//     const borders = ["bottom", "left", "top", "right"];
//     let startCorner = borders.indexOf(borderSkipped, 0);
//     if (startCorner === -1) {
//         startCorner = 0;
//     }

//     const cornerAt = (index: number) => {
//         return corners[(startCorner + index) % 4];
//     };

//     // Draw rectangle from 'startCorner'
//     let corner = cornerAt(0);
//     ctx.moveTo(corner[0], corner[1]);

//     for (let i = 1; i < 4; i++) {
//         corner = cornerAt(i);
//         let nextCornerId = i + 1;
//         if (nextCornerId === 4) {
//             nextCornerId = 0;
//         }

//         // const nextCorner = cornerAt(nextCornerId);

//         const width = corners[2][0] - corners[1][0];
//         const height = corners[0][1] - corners[1][1];
//         const x = corners[1][0];
//         const y = corners[1][1];

//         let radius = cornerRadius;
//         // Fix radius being too large
//         if (radius > Math.abs(height) / 2) {
//             radius = Math.floor(Math.abs(height) / 2);
//         }
//         if (radius > Math.abs(width) / 2) {
//             radius = Math.floor(Math.abs(width) / 2);
//         }

//         if (height < 0) {
//             // Negative values in a standard bar chart
//             const xTl = x;
//             const xTr = x + width;
//             const yTl = y + height;
//             const yTr = y + height;
//             const xBl = x;
//             const xBr = x + width;
//             const yBl = y;
//             const ybR = y;

//             // Draw
//             ctx.moveTo(xBl + radius, yBl);
//             ctx.lineTo(xBr - radius, ybR);
//             ctx.quadraticCurveTo(xBr, ybR, xBr, ybR - radius);
//             ctx.lineTo(xTr, yTr + radius);
//             ctx.quadraticCurveTo(xTr, yTr, xTr - radius, yTr);
//             ctx.lineTo(xTl + radius, yTl);
//             ctx.quadraticCurveTo(xTl, yTl, xTl, yTl + radius);
//             ctx.lineTo(xBl, yBl - radius);
//             ctx.quadraticCurveTo(xBl, yBl, xBl + radius, yBl);

//         } else if (width < 0) {
//             // Negative values in a horizontal bar chart
//             const xTl = x + width;
//             const xTr = x;
//             const yTl = y;
//             const yTr = y;

//             const xBl = x + width;
//             const xBr = x;
//             const yBl = y + height;
//             const yBr = y + height;

//             // Draw
//             ctx.moveTo(xBl + radius, yBl);
//             ctx.lineTo(xBr - radius, yBr);
//             ctx.quadraticCurveTo(xBr, yBr, xBr, yBr - radius);
//             ctx.lineTo(xTr, yTr + radius);
//             ctx.quadraticCurveTo(xTr, yTr, xTr - radius, yTr);
//             ctx.lineTo(xTl + radius, yTl);
//             ctx.quadraticCurveTo(xTl, yTl, xTl, yTl + radius);
//             ctx.lineTo(xBl, yBl - radius);
//             ctx.quadraticCurveTo(xBl, yBl, xBl + radius, yBl);

//         } else {
//             // Positive Value
//             ctx.moveTo(x + radius, y);
//             if (height > 0) {
//                 ctx.lineTo(x + width / 2 - 0.1, y);
//                 ctx.lineTo(x + width / 2 - 0.1, 0);
//                 ctx.lineTo(x + width / 2 + 0.1, 0);
//                 ctx.lineTo(x + width / 2 + 0.1, y);
//                 ctx.lineTo(x + width / 2, y);
//             }
//             ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
//             ctx.lineTo(x + width, y + height - radius);
//             ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
//             ctx.lineTo(x + radius, y + height);
//             ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
//             ctx.lineTo(x, y + radius);
//             ctx.quadraticCurveTo(x, y, x + radius, y);
//         }
//     }

//     ctx.fill();
//     if (borderWidth) {
//         ctx.stroke();
//     }
// };

interface Props {
    periodSeries: QuotePeriodResponse | null | undefined;
    graphType: "PeriodVolume" | "TotalLocked";
    quoteCurrency: Currency;
}

export const HistoryChart: React.FC<Props> = ({ periodSeries, graphType, quoteCurrency }) => {

    const [cachedSeries, setCachedPeriod] = useState<QuotePeriodData[] | null>(null);
    const [pendingSeries, setPendingPeriod] = useState<QuotePeriodData[] | null>(null);
    useEffect(() => {
        setCachedPeriod(pendingSeries); // .slice(periodSeries.historic.length - 7));
    }, [pendingSeries]);
    useEffect(() => {
        if (periodSeries) {
            setPendingPeriod(periodSeries.historic); // .slice(periodSeries.historic.length - 7));
            setCachedPeriod([]);
        }
    }, [periodSeries]);

    // const { previousCycle, pendingRewardsInEth, currentShareCount } = NetworkStateContainer.useContainer();

    // const currentSplit = pendingRewardsInEth.get(previousCycle);

    // const keys = React.useMemo(() => currentSplit ? currentSplit.keySeq().toArray() : [], [currentSplit]);
    // const values = React.useMemo(() => currentSplit ? currentSplit.valueSeq().map(bn => bn.multipliedBy(currentShareCount).decimalPlaces(6).toNumber()).toArray() : [], [currentSplit]);
    const empty = false; // React.useMemo(() => !!currentSplit && values.reduce((sum, value) => sum + value, 0) === 0, [currentSplit, values]);

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
                            labels: empty ? ["No rewards for cycle yet"] : cachedSeries.map(item => naturalTime(item.date, {
                                suffix: "ago",
                                message: "current",
                                countDown: false,
                                showingSeconds: false
                            })),
                            datasets: [{
                                // data: empty ? [100] : cachedSeries.map(item => item[`quote${graphType}`]),
                                // fillColor: gradient,
                                // backgroundColor: gradient,
                                // borderColor: "#001A38",
                                // maintainAspectRation: true,
                                // cornerRadius: 20,
                                // shadowOffsetX: 0,
                                // shadowOffsetY: 0,
                                // shadowBlur: 10,
                                // barHitRadius: 10,
                                // shadowColor: "#ffffff30",

                                data: empty ? [] : cachedSeries.map(item => item[`quote${graphType}`]),
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
                        // responsive: true,
                        // maintainAspectRatio: false,
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
                        elements: {
                            point: {
                                // radius: 25,
                                // hoverRadius: 35,
                                // pointStyle: "rectRounded",

                            }
                        },
                        tooltips: {
                            callbacks: {
                                // tslint:disable-next-line: no-any
                                title: (tooltipItem: any, data: any) => {
                                    return (graphType === "PeriodVolume" ? "Volume - " : "Value locked - ") + data.labels[tooltipItem[0].index];
                                },
                                // tslint:disable-next-line: no-any
                                label: (tooltipItem: any, data: any) => {
                                    return `${textCurrencyIcon(quoteCurrency)}${data.datasets[0].data[tooltipItem.index]} ${quoteCurrency.toUpperCase()}`;
                                },
                                // afterLabel: (tooltipItem: any, data: any) => {
                                //     return "";
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
                    }}
                />
            </div>
            </> : <Loading alt />}
        </div>
    </div>;
};
