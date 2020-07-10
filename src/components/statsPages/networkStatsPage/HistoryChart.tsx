import { Currency, Loading } from "@renproject/react-components";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts/highstock";
import React, { useEffect } from "react";

import { QuotePeriodResponse } from "../../../lib/graphQL/volumes";

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

export enum GraphType {
    TotalVolume = "TotalVolume",
    TotalLocked = "TotalLocked",
}

const getOptions = (data: Array<[number, number]>, quoteCurrency: Currency, graphType: GraphType) => ({
    rangeSelector: {
        // selected: 1
        enabled: false,
    },
    navigator: {
        enabled: false,
    },
    scrollbar: {
        enabled: false,
    },

    chart: {
        backgroundColor: null,
        width: 400,
    },

    yAxis: [{
        gridLineColor: null,
        labels: {
            enabled: false,
            style: {
                color: "white",
            }
        },
        min: 0,
    }],

    xAxis: [{
        lineColor: null,
        labels: {
            style: {
                color: "white",
            }
        },
    }],

    series: [{
        name: `${graphType === GraphType.TotalLocked ? "Value minted" : "Volume"} (${quoteCurrency.toUpperCase()})`,
        data,
        tooltip: {
            valueDecimals: 2
        },
        color: "#006FE8",
        lineWidth: 3,
    }]
});

interface Props {
    periodSeries: QuotePeriodResponse | null | undefined;
    graphType: GraphType;
    quoteCurrency: Currency;
}

export const HistoryChart: React.FC<Props> = ({ periodSeries, graphType, quoteCurrency }) => {

    // tslint:disable-next-line: no-any
    const [options, setOptions] = React.useState<any | null>(null);

    const cachedSeries = periodSeries && periodSeries.historic;

    useEffect(() => {
        if (cachedSeries) {
            setOptions(getOptions(cachedSeries.map(item =>
                [
                    item.date * 1000,
                    parseInt(item[`quote${graphType}`], 10)
                ]
            ), quoteCurrency, graphType));
        }
    }, [graphType, cachedSeries, quoteCurrency]);

    return <div className="overview--chart--outer" style={{ maxWidth: "100%" }}>
        <div className="volume--chart">
            {cachedSeries ? <><div className="overview--chart--canvas" style={{ maxWidth: "100%" }}>
                {options ?
                    <HighchartsReact
                        className={"highcharts--outer"}
                        highcharts={Highcharts}
                        constructorType={"stockChart"}
                        options={options}
                    /> :
                    null
                }
            </div>
            </> : <Loading alt />}
        </div>
    </div>;
};
