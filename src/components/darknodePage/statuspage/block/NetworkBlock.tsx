import * as React from "react";

import { faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { naturalTime } from "@renproject/react-components";
import filesize from "filesize";

import { darknodeIDHexToBase58 } from "../../../../lib/darknode/darknodeID";
import { DarknodesState } from "../../../../store/applicationState";
import { Block, BlockBody, BlockTitle } from "./Block";

export const NetworkBlock = (props: Props): JSX.Element => {
    const { darknodeDetails } = props;

    const darknodeIDBase58 = darknodeDetails ? darknodeIDHexToBase58(darknodeDetails.ID) : "";

    return (

        <Block className="network-block">
            <BlockTitle>
                <h3>
                    <FontAwesomeIcon icon={faServer} pull="left" />
                    Network Information
                </h3>
            </BlockTitle>

            {darknodeDetails ? <BlockBody>
                <div className="network-block--info">
                    <table className="darknode-info">
                        <tbody>
                            <tr><td>ID</td><td>{darknodeIDBase58}</td></tr>
                            <tr><td>Address</td><td>{darknodeDetails.ID}</td></tr>
                            <tr><td>Public Key</td><td>{darknodeDetails.publicKey}</td></tr>
                            <tr><td>Operator</td><td>{darknodeDetails.operator}</td></tr>
                            <tr><td>Version</td><td>{darknodeDetails.nodeStatistics ? darknodeDetails.nodeStatistics.version : ""}</td></tr>
                            <tr><td>MultiAddress</td><td>{darknodeDetails.nodeStatistics ? darknodeDetails.nodeStatistics.multiAddress : ""}</td></tr>
                            <tr><td>Memory</td><td>{darknodeDetails.nodeStatistics ? filesize(darknodeDetails.nodeStatistics.memory) : ""}</td></tr>
                            <tr><td>Memory Used</td><td>{darknodeDetails.nodeStatistics ? filesize(darknodeDetails.nodeStatistics.memoryUsed) : ""}</td></tr>
                            <tr><td>Memory Free</td><td>{darknodeDetails.nodeStatistics ? filesize(darknodeDetails.nodeStatistics.memoryFree) : ""}</td></tr>
                            <tr><td>Disk</td><td>{darknodeDetails.nodeStatistics ? filesize(darknodeDetails.nodeStatistics.disk) : ""}</td></tr>
                            <tr><td>Disk Used</td><td>{darknodeDetails.nodeStatistics ? filesize(darknodeDetails.nodeStatistics.diskUsed) : ""}</td></tr>
                            <tr><td>Disk Free</td><td>{darknodeDetails.nodeStatistics ? filesize(darknodeDetails.nodeStatistics.diskFree) : ""}</td></tr>
                            <tr><td>System Uptime</td><td>{darknodeDetails.nodeStatistics ? naturalTime(Date.now() / 1000 - darknodeDetails.nodeStatistics.systemUptime, {
                                message: "Just now",
                                countDown: false,
                                showingSeconds: false
                            }) : ""}</td></tr>
                            <tr><td>Service Uptime</td><td>{darknodeDetails.nodeStatistics ? naturalTime(Date.now() / 1000 - darknodeDetails.nodeStatistics.serviceUptime, {
                                message: "Just now",
                                countDown: false,
                                showingSeconds: false
                            }) : ""}</td></tr>
                            <tr><td>CPU Cores</td><td>{darknodeDetails.nodeStatistics ? darknodeDetails.nodeStatistics.cores : ""}</td></tr>
                        </tbody>
                    </table>
                </div>
            </BlockBody> : null}
        </Block>
    );
};

// tslint:disable: react-unused-props-and-state
interface Props {
    darknodeDetails: DarknodesState | null;
}
