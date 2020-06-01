import * as React from "react";

import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { RegistrationStatus } from "../../../../lib/ethereum/contractReads";
import { classNames } from "../../../../lib/react/className";
import { GithubAPIContainer } from "../../../../store/githubApiStore";
import { DarknodesState } from "../../../../store/networkStateContainer";
import { ExternalLink } from "../../../common/ExternalLink";
import { StatusDot, StatusDotColor } from "../../../common/StatusDot";
import { Block, BlockBody, BlockTitle } from "./Block";

const UPDATE_DARKNODE_LINK = "https://docs.renproject.io/darknodes/manage/updating";

interface Props {
    darknodeDetails: DarknodesState | null;
}

export const VersionBlock: React.FC<Props> = ({ darknodeDetails }) => {
    const { latestDarknodeVersionFull, isDarknodeUpToDate, latestDarknodeVersionDaysAgo } = GithubAPIContainer.useContainer();

    const upToDate: boolean | null = darknodeDetails && darknodeDetails.nodeStatistics ? isDarknodeUpToDate(darknodeDetails.nodeStatistics.version) : null;

    return (

        <Block className="version-block">
            <BlockTitle>
                <h3>
                    <FontAwesomeIcon icon={faBolt} pull="left" />
                    Darknode Status
                </h3>
            </BlockTitle>

            <div className={classNames("version-block--status", darknodeDetails && darknodeDetails.nodeStatistics ? "version-block--status--operational" : "")}>
                <StatusDot color={darknodeDetails && darknodeDetails.nodeStatistics ? StatusDotColor.Green : StatusDotColor.Yellow} size={24} />
                {darknodeDetails ? (darknodeDetails.nodeStatistics ?
                    "Operational" :
                    darknodeDetails.registrationStatus === RegistrationStatus.Registered ? "Unable to connect" : "Not registered") : "Connecting..."}
            </div>

            <div className="block--advanced--bottom">
                {darknodeDetails ? <BlockBody>
                    <div className="network-block--info">
                        <table className="darknode-info">
                            <tbody>
                                <tr><td>Your Software Version</td><td>{darknodeDetails.nodeStatistics ? darknodeDetails.nodeStatistics.version : ""}</td></tr>
                                <tr><td>Latest Version</td><td>{latestDarknodeVersionFull ? latestDarknodeVersionFull : ""} {upToDate !== null ? upToDate ? <>{" "}- <span className="green">Up to date</span></> : <>{" "}- <ExternalLink className="blue" href={UPDATE_DARKNODE_LINK}>Update now</ExternalLink></> : ""}</td></tr>
                                <tr><td>Version published</td><td>{latestDarknodeVersionDaysAgo}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </BlockBody> : null}
            </div>
        </Block>
    );
};
