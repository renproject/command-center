import {
    Currency,
    CurrencyIcon,
    Loading,
    textCurrencyIcon,
} from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { BigNumberRecord } from "../../../lib/graphQL/queries/renVmTracker";
import { SimpleTable } from "../../../views/SimpleTable";

import { TokenIcon } from "../../../views/tokenIcon/TokenIcon";

const colors = [
    "#004CA0",
    // "#005EC4",
    "#006FE8",
    // "#002A58",
    "#003B7C",
];

export type DoughnutChartData = BigNumberRecord | null;

interface Props {
    data?: DoughnutChartData;
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
                ? OrderedMap<string, { quote: BigNumber; amount: BigNumber }>(
                      Object.entries(data),
                  )
                      .sortBy(({ quote }) => quote.toNumber())
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
                                                data[token].quote.toNumber(),
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
                                            title: (
                                                tooltipItem: Array<{
                                                    index: string;
                                                }>,
                                                line: {
                                                    labels: {
                                                        [key: string]: string;
                                                    };
                                                },
                                            ) => {
                                                return (
                                                    title +
                                                    " - " +
                                                    line.labels[
                                                        tooltipItem[0].index
                                                    ]
                                                );
                                            },
                                            label: (
                                                tooltipItem: {
                                                    index: string;
                                                },
                                                line: {
                                                    datasets: Array<{
                                                        data: number[];
                                                        _meta: Array<{
                                                            total: number;
                                                        }>;
                                                    }>;
                                                    labels: {
                                                        [key: string]: string;
                                                    };
                                                },
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
                            <SimpleTable>
                                {data && tokens
                                    ? tokens.map((token) => {
                                          const entry = data[token];
                                          const standardAmount = entry.standardAmount.toFormat(
                                              entry.standardAmount.isGreaterThan(
                                                  100,
                                              )
                                                  ? 0
                                                  : 2,
                                          );
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
                                                      {entry.standardAmount.isGreaterThan(
                                                          0,
                                                      ) ? (
                                                          <span className="overview--chart--legend--faded">
                                                              {standardAmount}{" "}
                                                              {token}
                                                              {" - "}
                                                          </span>
                                                      ) : entry.amount.isGreaterThan(
                                                            0,
                                                        ) ? (
                                                          <span className="overview--chart--legend--faded">
                                                              {entry.amount.toFormat(
                                                                  0,
                                                              )}{" "}
                                                              {" - "}
                                                          </span>
                                                      ) : null}
                                                      <CurrencyIcon
                                                          currency={
                                                              quoteCurrency
                                                          }
                                                      />
                                                      {entry.quote.toFormat(2)}
                                                  </div>
                                              </div>
                                          );
                                      })
                                    : null}
                            </SimpleTable>
                        </div>
                    </>
                ) : (
                    <Loading alt />
                )}
            </div>
        </div>
    );
};
