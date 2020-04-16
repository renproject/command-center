import * as React from "react";

import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { naturalTime } from "@renproject/react-components";

import { darknodeIDHexToBase58 } from "../../../../lib/darknode/darknodeID";
import { DarknodesState } from "../../../../store/applicationState";
import { Block, BlockBody, BlockTitle } from "./Block";

export const VersionBlock = (props: Props): JSX.Element => {
    const { darknodeDetails } = props;

    const darknodeIDBase58 = darknodeDetails ? darknodeIDHexToBase58(darknodeDetails.ID) : "";

    return (

        <Block className="version-block">
            <BlockTitle>
                <h3>
                    <FontAwesomeIcon icon={faBolt} pull="left" />
                    Darknode Status
                </h3>
            </BlockTitle>

            <div className="version-block--status">
                <span><span /></span> Operational
            </div>

            <div className="block--advanced--bottom">
                {darknodeDetails ? <BlockBody>
                    <div className="network-block--info">
                        <table className="darknode-info">
                            <tbody>
                                <tr><td>Your Software Version</td><td>{darknodeDetails.nodeStatistics ? darknodeDetails.nodeStatistics.version : ""}</td></tr>
                                <tr><td>Latest Version</td><td>{darknodeDetails.nodeStatistics ? darknodeDetails.nodeStatistics.version : ""}</td></tr>
                                <tr><td>Date Registered</td><td>{darknodeDetails.nodeStatistics ? naturalTime(Date.now() / 1000 - darknodeDetails.nodeStatistics.systemUptime, {
                                    message: "Just now",
                                    countDown: false,
                                    showingSeconds: false
                                }) : ""}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </BlockBody> : null}
            </div>
        </Block>
    );
};

// tslint:disable: react-unused-props-and-state
interface Props {
    darknodeDetails: DarknodesState | null;
}
