import { Currency, CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { OrderedMap } from "immutable";
import React from "react";
import { BigNumberRecord } from "../../../lib/graphQL/queries/renVmTracker";
import { SimpleTable } from "../../../views/SimpleTable";

import { TokenIcon } from "../../../views/tokenIcon/TokenIcon";

const colors = ["#004CA0", "#005EC4", "#006FE8", "#002A58", "#003B7C"];

type DoughnutChartData = BigNumberRecord | null;

const getOptions = (
    seriesData: DoughnutChartData | undefined,
    quoteCurrency: Currency,
) => ({
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: "pie",
        backgroundColor: null,
        borderColor: null,
        height: "40%",
    },
    title: null,
    tooltip: {
        pointFormat: `{series.name}: <b>{point.yPretty:.1f} ${quoteCurrency.toUpperCase()}</b>`,
    },
    accessibility: {
        point: {
            valueSuffix: "%",
        },
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: "pointer",
            borderWidth: 0,
            dataLabels: {
                enabled: false,
            },
        },
    },
    series: [
        {
            name: "Volume",
            colorByPoint: true,
            innerSize: "60%",
            data: seriesData
                ? OrderedMap<string, { quote: BigNumber; amount: BigNumber }>(
                      Object.entries(seriesData),
                  )
                      .toArray()
                      .map(([key, value], i) => ({
                          name: key,
                          y: value.quote.toNumber(),
                          yPretty: value.quote.toFormat(0),
                          color: colors[i % colors.length],
                          borderColor: null,
                      }))
                : [],
        },
    ],
});

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

    const options = React.useMemo(
        () => getOptions(data, quoteCurrency),
        [data, quoteCurrency],
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
                            style={{ maxWidth: "100%" }}
                        >
                            <HighchartsReact
                                className={"highcharts--outer"}
                                highcharts={Highcharts}
                                constructorType={"chart"}
                                options={options}
                            />
                        </div>
                        <div className="overview--chart--legend">
                            <SimpleTable>
                                {data && tokens
                                    ? tokens.map((token) => {
                                          const entry = data[token];
                                          const standardAmount =
                                              entry.standardAmount.toFormat(
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
