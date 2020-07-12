import { faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import filesize from "filesize";
import React from "react";
import { Doughnut } from "react-chartjs-2";

import { DarknodesState } from "../../../../store/networkContainer";
import { Block, BlockBody, BlockTitle } from "./Block";

interface Props {
    darknodeDetails: DarknodesState | null;
}

export const ResourcesBlock: React.FC<Props> = ({ darknodeDetails }) =>
    <Block className="resources-block">
        <BlockTitle>
            <h3>
                <FontAwesomeIcon icon={faServer as FontAwesomeIconProps["icon"]} pull="left" />
                    Resource Usage
                </h3>
        </BlockTitle>

        {darknodeDetails ? <BlockBody>
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
                                    darknodeDetails.nodeStatistics ? `Used: ${filesize(darknodeDetails.nodeStatistics.memoryUsed)} -` : "Used: Unknown -",
                                    darknodeDetails.nodeStatistics ? `Free: ${filesize(darknodeDetails.nodeStatistics.memoryFree)} -` : "Free: Unknown -",
                                ],
                                datasets: [{
                                    data: darknodeDetails.nodeStatistics ?
                                        [
                                            darknodeDetails.nodeStatistics.memoryUsed,
                                            darknodeDetails.nodeStatistics.memoryFree,
                                        ] : [
                                            0,
                                            100,
                                        ],
                                    backgroundColor: [
                                        "#006FE8",
                                        "#00000000",
                                    ],
                                    borderColor: "#001A38",
                                    maintainAspectRation: true,
                                    // hoverBackgroundColor: [],
                                }]
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
                                    darknodeDetails.nodeStatistics ? `Used: ${filesize(darknodeDetails.nodeStatistics.diskUsed)} -` : "Used: Unknown -",
                                    darknodeDetails.nodeStatistics ? `Free: ${filesize(darknodeDetails.nodeStatistics.diskFree)} -` : "Free: Unknown -",
                                ],
                                datasets: [{
                                    data: darknodeDetails.nodeStatistics ?
                                        [
                                            darknodeDetails.nodeStatistics.diskUsed,
                                            darknodeDetails.nodeStatistics.diskFree,
                                        ] : [
                                            0,
                                            100,
                                        ],
                                    backgroundColor: [
                                        "#006FE8",
                                        "#00000000",
                                    ],
                                    borderColor: "#001A38",
                                    maintainAspectRation: true,
                                    // hoverBackgroundColor: [],
                                }]
                            }}
                        />
                    </div>
                    <p>Disk Usage</p>
                </div>
            </div>
        </BlockBody> : null}
    </Block>;
