import * as React from "react";

import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { classNames } from "../../../../lib/react/className";
import { GithubAPIContainer } from "../../../../store/githubApiStore";
import { DarknodesState } from "../../../../store/networkStateContainer";
import { Block, BlockBody, BlockTitle } from "./Block";

const UPDATE_DARKNODE_LINK = "https://docs.renproject.io/darknodes/manage/updating";

export const VersionBlock = ({ darknodeDetails }: Props): JSX.Element => {
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
                <span><span /></span> {darknodeDetails ? darknodeDetails.nodeStatistics ? "Operational" : "Unable to connect" : "Connecting..."}
            </div>

            <div className="block--advanced--bottom">
                {darknodeDetails ? <BlockBody>
                    <div className="network-block--info">
                        <table className="darknode-info">
                            <tbody>
                                <tr><td>Your Software Version</td><td>{darknodeDetails.nodeStatistics ? darknodeDetails.nodeStatistics.version : ""}</td></tr>
                                <tr><td>Latest Version</td><td>{latestDarknodeVersionFull ? latestDarknodeVersionFull : ""} {upToDate !== null ? upToDate ? <>{" "}- <span className="green">Up to date</span></> : <>{" "}- <a className="blue" target="_blank" rel="noopener noreferrer" href={UPDATE_DARKNODE_LINK}>Update now</a></> : ""}</td></tr>
                                <tr><td>Version published</td><td>{latestDarknodeVersionDaysAgo}</td></tr>
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
