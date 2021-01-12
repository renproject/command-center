import { faServer } from "@fortawesome/free-solid-svg-icons";
import {
    FontAwesomeIcon,
    FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { naturalTime } from "@renproject/react-components";
import React from "react";

import { darknodeIDHexToBase58 } from "../../lib/darknode/darknodeID";
import { ReactComponent as CopyIcon } from "../../styles/images/icon-copy.svg";
import { SECONDS } from "../../controllers/common/BackgroundTasks";
import { Block, BlockBody, BlockTitle } from "./Block";
import { NodeStatistics } from "../../lib/darknode/jsonrpc";

interface Props {
    darknodeID: string | null;
    nodeStatistics: NodeStatistics | null;
}

export const NetworkBlock: React.FC<Props> = ({
    darknodeID,
    nodeStatistics,
}) => {
    const darknodeIDBase58 = darknodeID
        ? darknodeIDHexToBase58(darknodeID)
        : "";

    return (
        <Block className="network-block">
            <BlockTitle>
                <h3>
                    <FontAwesomeIcon
                        icon={faServer as FontAwesomeIconProps["icon"]}
                        pull="left"
                    />
                    Technical Info
                </h3>
            </BlockTitle>

            <BlockBody>
                <div className="network-block--info">
                    <table className="darknode-info">
                        <tbody>
                            <tr>
                                <td>ID</td>
                                <td>
                                    <CopyIcon /> {darknodeIDBase58}
                                </td>
                            </tr>
                            {/* <tr><td>Operator</td><td>{darknodeDetails.operator}</td></tr> */}
                            <tr>
                                <td>MultiAddress</td>
                                <td>
                                    <CopyIcon />{" "}
                                    {nodeStatistics
                                        ? nodeStatistics.multiAddress
                                        : ""}
                                </td>
                            </tr>
                            <tr>
                                <td>System Uptime</td>
                                <td>
                                    <CopyIcon />{" "}
                                    {nodeStatistics
                                        ? naturalTime(
                                              Date.now() / SECONDS -
                                                  nodeStatistics.systemUptime,
                                              {
                                                  message: "Just now",
                                                  countDown: false,
                                                  showingSeconds: false,
                                              },
                                          )
                                        : ""}
                                </td>
                            </tr>
                            <tr>
                                <td>Service Uptime</td>
                                <td>
                                    <CopyIcon />{" "}
                                    {nodeStatistics
                                        ? naturalTime(
                                              Date.now() / SECONDS -
                                                  nodeStatistics.serviceUptime,
                                              {
                                                  message: "Just now",
                                                  countDown: false,
                                                  showingSeconds: false,
                                              },
                                          )
                                        : ""}
                                </td>
                            </tr>
                            <tr>
                                <td>CPU Cores</td>
                                <td>
                                    <CopyIcon />{" "}
                                    {nodeStatistics ? nodeStatistics.cores : ""}
                                </td>
                            </tr>
                            <tr>
                                <td>ID (hex)</td>
                                <td>
                                    <CopyIcon /> {darknodeID}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </BlockBody>
        </Block>
    );
};
