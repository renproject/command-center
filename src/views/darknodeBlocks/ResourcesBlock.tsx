import { faServer } from "@fortawesome/free-solid-svg-icons";
import {
    FontAwesomeIcon,
    FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import filesize from "filesize";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { NodeStatistics } from "../../lib/darknode/jsonrpc";

import { DarknodesState } from "../../store/networkContainer";
import { Block, BlockBody, BlockTitle } from "./Block";

interface Props {
    nodeStatistics: NodeStatistics | null;
}

export const ResourcesBlock: React.FC<Props> = ({ nodeStatistics }) => (
    <Block className="resources-block">
        <BlockTitle>
            <h3>
                <FontAwesomeIcon
                    icon={faServer as FontAwesomeIconProps["icon"]}
                    pull="left"
                />
                Resource Usage
            </h3>
        </BlockTitle>

        {nodeStatistics ? (
            <BlockBody>
                <div className="resources--block--charts">
                    <div className="resources--chart--and--label">
                        <div>
                            <Doughnut
                                height={100}
                                width={100}
                                legend={{ display: false }}
                                data={{
                                    maintainAspectRation: true,
                                    labels: [
                                        nodeStatistics
                                            ? `Used: ${filesize(
                                                  nodeStatistics.memoryUsed,
                                              )} -`
                                            : "Used: Unknown -",
                                        nodeStatistics
                                            ? `Free: ${filesize(
                                                  nodeStatistics.memoryFree,
                                              )} -`
                                            : "Free: Unknown -",
                                    ],
                                    datasets: [
                                        {
                                            data: nodeStatistics
                                                ? [
                                                      nodeStatistics.memoryUsed,
                                                      nodeStatistics.memoryFree,
                                                  ]
                                                : [0, 100],
                                            backgroundColor: [
                                                "#006FE8",
                                                "#00000000",
                                            ],
                                            borderColor: "#001A38",
                                            maintainAspectRation: true,
                                            // hoverBackgroundColor: [],
                                        },
                                    ],
                                }}
                            />
                        </div>
                        <p>Memory Usage</p>
                    </div>
                    <div className="resources--chart--and--label">
                        <div>
                            <Doughnut
                                height={100}
                                width={100}
                                legend={{ display: false }}
                                data={{
                                    maintainAspectRation: true,
                                    labels: [
                                        nodeStatistics
                                            ? `Used: ${filesize(
                                                  nodeStatistics.diskUsed,
                                              )} -`
                                            : "Used: Unknown -",
                                        nodeStatistics
                                            ? `Free: ${filesize(
                                                  nodeStatistics.diskFree,
                                              )} -`
                                            : "Free: Unknown -",
                                    ],
                                    datasets: [
                                        {
                                            data: nodeStatistics
                                                ? [
                                                      nodeStatistics.diskUsed,
                                                      nodeStatistics.diskFree,
                                                  ]
                                                : [0, 100],
                                            backgroundColor: [
                                                "#006FE8",
                                                "#00000000",
                                            ],
                                            borderColor: "#001A38",
                                            maintainAspectRation: true,
                                            // hoverBackgroundColor: [],
                                        },
                                    ],
                                }}
                            />
                        </div>
                        <p>Disk Usage</p>
                    </div>
                </div>
            </BlockBody>
        ) : null}
    </Block>
);
