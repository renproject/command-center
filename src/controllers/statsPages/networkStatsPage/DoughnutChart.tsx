import {
    Currency,
    CurrencyIcon,
    Loading,
    textCurrencyIcon,
    TokenIcon,
} from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import React from "react";
import { Doughnut } from "react-chartjs-2";

const colors = [
    "#004CA0",
    // "#005EC4",
    "#006FE8",
    // "#002A58",
    "#003B7C",
];

interface Props {
    data: { [token: string]: BigNumber } | null | undefined;
    quoteCurrency: Currency;
    title: string;
}

export const DoughnutChart: React.FC<Props> = ({
    data,
    quoteCurrency,
    title,
}) => {
    const tokens = React.useMemo(
        () =>
            data
                ? OrderedMap<string, BigNumber>(Object.entries(data))
                      .sortBy((value) => value.toNumber())
                      .reverse()
                      .keySeq()
                      .toArray()
                : undefined,
        [data],
    );

    return (
        <div
            className="overview--chart--outer"
            style={{ maxWidth: "calc(100vw - 80px)" }}
        >
            <div className="overview--chart">
                {data && tokens ? (
                    <>
                        <div
                            className="overview--chart--canvas"
                            style={{ maxWidth: "calc(100vw - 80px)" }}
                        >
                            <Doughnut
                                height={186}
                                width={186}
                                legend={{ display: false }}
                                data={{
                                    maintainAspectRation: true,
                                    labels: tokens,
                                    datasets: [
                                        {
                                            data: tokens.map((token) =>
                                                data[token].toNumber(),
                                            ),
                                            backgroundColor: colors,
                                            borderColor: "#001A38",
                                            maintainAspectRation: true,
                                            // hoverBackgroundColor: [],
                                        },
                                    ],
                                }}
                                options={{
                                    tooltips: {
                                        callbacks: {
                                            // tslint:disable-next-line: no-any
                                            title: (
                                                tooltipItem: any,
                                                line: any,
                                            ) => {
                                                return (
                                                    title +
                                                    " - " +
                                                    line.labels[
                                                        tooltipItem[0].index
                                                    ]
                                                );
                                            },
                                            // tslint:disable-next-line: no-any
                                            label: (
                                                tooltipItem: any,
                                                line: any,
                                            ) => {
                                                const dataset =
                                                    line.datasets[0];
                                                const percent = dataset._meta[0]
                                                    ? Math.round(
                                                          (dataset.data[
                                                              tooltipItem.index
                                                          ] /
                                                              dataset._meta[0]
                                                                  .total) *
                                                              100,
                                                      )
                                                    : undefined;
                                                return `${textCurrencyIcon(
                                                    quoteCurrency,
                                                )}${new BigNumber(
                                                    line.datasets[0].data[
                                                        tooltipItem.index
                                                    ],
                                                ).toFormat()} ${quoteCurrency.toUpperCase()}${
                                                    percent !== undefined
                                                        ? ` - ${percent}%`
                                                        : ""
                                                }`;
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
                                    },
                                }}
                            />
                        </div>
                        <div className="overview--chart--legend">
                            <div className="overview--chart--legend--table">
                                {data && tokens
                                    ? tokens.map((token) => {
                                          return (
                                              <div key={token}>
                                                  <div>
                                                      <TokenIcon
                                                          token={token}
                                                          white={true}
                                                      />
                                                      <span>{token}</span>
                                                  </div>
                                                  <div>
                                                      <CurrencyIcon
                                                          currency={
                                                              quoteCurrency
                                                          }
                                                      />
                                                      {/* <TokenBalance */}
                                                      {/* token={Token.ETH} */}
                                                      {data[token].toFormat()}
                                                      {/* convertTo={quoteCurrency} */}
                                                      {/* /> */}
                                                  </div>
                                              </div>
                                          );
                                      })
                                    : null}
                            </div>
                        </div>
                    </>
                ) : (
                    <Loading alt />
                )}
            </div>
        </div>
    );
};
