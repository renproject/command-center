import styled from "styled-components";

export const OverviewDiv = styled.div`
    &.container {
        max-width: 2200px;
    }

    .overview--bottom {
        display: flex;
        align-items: center;
        flex-wrap: wrap;

        > * {
            flex-grow: 1;
        }

        @media (min-width: ${(props) => props.theme.grid.minMd}) {
            .map {
                flex-grow: 4;
            }
        }

        > canvas {
            width: 200px !important;
            height: 200px !important;
        }

        .overview--bottom--right {
            display: flex;
            flex-flow: column;

            > div {
                background: #001327;
                border-radius: 4px;
                margin: 0;

                & + div {
                    margin-top: 10px;
                }
            }
        }

        .CircularProgressbar {
            width: unset;
        }

        .overview--chart--outer {
            background: linear-gradient(
                -180deg,
                #00457f -1080.14%,
                #002148 85.91%
            );
            border-radius: 4px;
            height: 400px;

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

        .overview--chart {
            flex: 1 1 0px;

            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    .darknode-cli {
        padding: 20px;
    }

    .darknode-cli--button {
        background: #006fe8;
        box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.3);
        border-radius: 4px !important;
        width: 216px !important;
    }
`;
