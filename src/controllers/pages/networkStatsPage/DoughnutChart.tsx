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
import { SimpleTable } from "../../../views/SimpleTable";

import { TokenIcon } from "../../../views/tokenIcon/TokenIcon";

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
    altData: { [token: string]: BigNumber } | undefined | null;
}

export const DoughnutChart: React.FC<Props> = ({
    data,
    quoteCurrency,
    title,
    altData,
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
                                                      {!data[token].isZero() ||
                                                      !altData ? (
                                                          <>
                                                              <CurrencyIcon
                                                                  currency={
                                                                      quoteCurrency
                                                                  }
                                                              />
                                                              {data[
                                                                  token
                                                              ].toFormat()}
                                                          </>
                                                      ) : (
                                                          <span className="overview--chart--legend--faded">
                                                              {altData[
                                                                  token
                                                              ].toFormat()}{" "}
                                                              {token}
                                                          </span>
                                                      )}
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
