import styled from "styled-components";

export const NetworkStatsStyles = styled.div`
    > div {
        width: 100%;
        padding: 10px;
    }

    &.container {
        max-width: 2200px;
        display: flex;
        flex-flow: wrap;
    }

    .overview--bottom {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-wrap: wrap;

        margin-top: 50px;

        > * {
            width: 100%;
        }

        // >* {
        //     flex-grow: 1;
        // }

        > canvas {
            width: 186px !important;
            height: 186px !important;
        }

        .overview--chart--outer {
            width: 100%;
            border-radius: 4px;
            height: 500px;

            flex: 1 1 0px;

            display: flex;
            flex-flow: column;
            align-items: center;
            justify-content: space-between;
        }

        .chart--tabs {
            cursor: pointer;
            width: 100%;
            margin: 0px;
            margin-bottom: 0;
            display: flex;

            padding: 0 0px;
        }

        .chart--tab {
            background: none;
            border: none;
            font-size: 14px;
            line-height: 16px;
            text-align: center;

            color: #9195a0;

            > span {
                opacity: 0.5;
            }

            width: 50%;
            transition: all 200ms;
            border: 1px solid transparent;
            padding: 10px;
            border-bottom: 2px solid #001b39;
        }

        .chart--tab + .chart--tab {
            border-left: 2px solid #001b39;
        }

        .chart--tab--selected {
            border-bottom: 2px solid transparent;
            box-shadow: none;
            color: #e0e3eb;

            > span {
                opacity: 1;
            }
        }

        .volume--chart {
            @extend .overview--chart;
            width: 100%;
        }

        .overview--chart {
            flex: 1 1 0px;
            width: 100%;

            display: flex;
            flex-flow: column;
            align-items: center;
            justify-content: center;

            .overview--chart--legend {
                margin-top: 60px;
                width: 100%;
            }

            .overview--chart--legend--faded {
                opacity: 0.6;
            }
        }
    }
`;
