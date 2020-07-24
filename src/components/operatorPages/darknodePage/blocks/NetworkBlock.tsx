import * as React from "react";

import { faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { naturalTime } from "@renproject/react-components";

import { darknodeIDHexToBase58 } from "../../../../lib/darknode/darknodeID";
import { DarknodesState } from "../../../../store/networkContainer";
import { ReactComponent as CopyIcon } from "../../../../styles/images/icon-copy.svg";
import { SECONDS } from "../../../common/BackgroundTasks";
import { Block, BlockBody, BlockTitle } from "./Block";

interface Props {
    darknodeDetails: DarknodesState | null;
}

export const NetworkBlock: React.FC<Props> = ({ darknodeDetails }) => {
    const darknodeIDBase58 = darknodeDetails ? darknodeIDHexToBase58(darknodeDetails.ID) : "";

    return (

        <Block className="network-block">
            <BlockTitle>
                <h3>
                    <FontAwesomeIcon icon={faServer as FontAwesomeIconProps["icon"]} pull="left" />
                    Technical Info
                </h3>
            </BlockTitle>

            {darknodeDetails ? <BlockBody>
                <div className="network-block--info">
                    <table className="darknode-info">
                        <tbody>
                            <tr><td>ID</td><td><CopyIcon /> {darknodeIDBase58}</td></tr>
                            {/* <tr><td>Address</td><td>{darknodeDetails.ID}</td></tr> */}
                            {/* <tr><td>Public Key</td><td>{darknodeDetails.publicKey}</td></tr> */}
                            {/* <tr><td>Operator</td><td>{darknodeDetails.operator}</td></tr> */}
                            {/* <tr><td>Version</td><td>{darknodeDetails.nodeStatistics ? darknodeDetails.nodeStatistics.version : ""}</td></tr> */}
                            <tr><td>MultiAddress</td><td><CopyIcon /> {darknodeDetails.nodeStatistics ? darknodeDetails.nodeStatistics.multiAddress : ""}</td></tr>
                            <tr><td>System Uptime</td><td><CopyIcon /> {darknodeDetails.nodeStatistics ? naturalTime(Date.now() / SECONDS - darknodeDetails.nodeStatistics.systemUptime, {
                                message: "Just now",
                                countDown: false,
                                showingSeconds: false
                            }) : ""}</td></tr>
                            <tr><td>Service Uptime</td><td><CopyIcon /> {darknodeDetails.nodeStatistics ? naturalTime(Date.now() / SECONDS - darknodeDetails.nodeStatistics.serviceUptime, {
                                message: "Just now",
                                countDown: false,
                                showingSeconds: false
                            }) : ""}</td></tr>
                            <tr><td>CPU Cores</td><td><CopyIcon /> {darknodeDetails.nodeStatistics ? darknodeDetails.nodeStatistics.cores : ""}</td></tr>
                            <tr><td>ID (hex)</td><td><CopyIcon /> {darknodeDetails.ID}</td></tr>
                        </tbody>
                    </table>
                </div>
            </BlockBody> : null}
        </Block>
    );
};
