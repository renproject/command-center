import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts/highstock";
import React, { useMemo } from "react";

export interface Line {
    name: string;
    data: Array<[number, number]>;
    axis?: number;
    hidden?: boolean;
    color?: string;
}

/**
 * DOCS: https://api.highcharts.com/highstock/
 */
const getOptions = (seriesData: Line[], lockedMode = false) => ({
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

    legend: {
        enabled: lockedMode,
        itemStyle: {
            color: "white",
            fontWeight: "normal"
        },
        itemHoverStyle: {
            color: "#aaa",
        },
    },

    chart: {
        backgroundColor: null,
        height: lockedMode ? "89%" : "80%",
    },

    yAxis: Array.from(
        new Array(
            seriesData.reduce(
                (acc, data) => Math.max(acc, (data.axis || 0) + 1),
                1,
            ),
        ),
    ).map((_) => ({
        gridLineColor: "#1A2E46",
        opposite: false,
        labels: {
            enabled: true,
            style: {
                color: "white",
            },
        },
    })),

    xAxis: [
        {
            lineColor: null,
            labels: {
                style: {
                    color: "white",
                },
            },
        },
    ],
    tooltip: {
        enabled: !lockedMode
    },
    series: seriesData.map(({ name, data, axis, hidden, color }, i) => ({
        name,
        data,
        color: color || "#006FE8",
        yAxis: axis || 0,
        visible: !hidden,
        lineWidth: 3,
    })),
});

interface Props {
    lines: Array<Line | undefined>;
    lockedMode?: boolean;
}

export const Graph: React.FC<Props> = ({ lines, lockedMode }) => {
    const options = useMemo(
        () => getOptions(lines.filter((line) => line !== undefined) as Line[], lockedMode),
        [lines, lockedMode],
    );

    console.log("r: opts", options);
    return (
        <div className="highcharts--with-outside-tooltip">
            <div
                className="overview--chart--canvas"
                style={{ maxWidth: "100%" }}
            >
                <HighchartsReact
                    className={"highcharts--outer"}
                    highcharts={Highcharts}
                    constructorType={"stockChart"}
                    options={options}
                />
            </div>
        </div>
    );
};
