import { faBolt } from "@fortawesome/free-solid-svg-icons";
import {
    FontAwesomeIcon,
    FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import React from "react";

import { RegistrationStatus } from "../../../../lib/ethereum/contractReads";
import { isDefined } from "../../../../lib/general/isDefined";
import { classNames } from "../../../../lib/react/className";
import { GithubAPIContainer } from "../../../../store/githubApiContainer";
import { GraphContainer } from "../../../../store/graphContainer";
import { DarknodesState } from "../../../../store/networkContainer";
import { ExternalLink } from "../../../../views/ExternalLink";
import { StatusDot, StatusDotColor } from "../../../../views/StatusDot";
import { Block, BlockBody, BlockTitle } from "./Block";

const UPDATE_DARKNODE_LINK =
    "https://docs.renproject.io/darknodes/manage/updating";

interface Props {
    darknodeDetails: DarknodesState | null;
}

export const VersionBlock: React.FC<Props> = ({ darknodeDetails }) => {
    const {
        latestDarknodeVersionFull,
        isDarknodeUpToDate,
        latestDarknodeVersionDaysAgo,
    } = GithubAPIContainer.useContainer();

    const upToDate: boolean | null =
        darknodeDetails && darknodeDetails.nodeStatistics
            ? isDarknodeUpToDate(darknodeDetails.nodeStatistics.version)
            : null;

    const { renVM } = GraphContainer.useContainer();
    const epochStart = renVM
        ? Date.now() / 1000 - renVM.currentEpoch.timestamp.toNumber()
        : undefined;
    const bootstrapping = epochStart !== undefined && epochStart < 24 * 60 * 60;

    return (
        <Block className="version-block">
            <BlockTitle>
                <h3>
                    <FontAwesomeIcon
                        icon={faBolt as FontAwesomeIconProps["icon"]}
                        pull="left"
                    />
                    Darknode Status
                </h3>
            </BlockTitle>

            <div
                className={classNames(
                    "version-block--status",
                    darknodeDetails && darknodeDetails.nodeStatistics
                        ? "version-block--status--operational"
                        : "",
                )}
            >
                <StatusDot
                    color={
                        darknodeDetails && darknodeDetails.nodeStatistics
                            ? StatusDotColor.Green
                            : StatusDotColor.Yellow
                    }
                    size={24}
                />
                {darknodeDetails
                    ? darknodeDetails.nodeStatistics
                        ? "Operational"
                        : darknodeDetails.registrationStatus ===
                          RegistrationStatus.Registered
                        ? bootstrapping
                            ? "Bootstrapping"
                            : "Unable to connect"
                        : "Not registered"
                    : "Connecting..."}
            </div>

            <div className="block--advanced--bottom">
                {darknodeDetails ? (
                    <BlockBody>
                        <div className="network-block--info">
                            <table className="darknode-info">
                                <tbody>
                                    <tr>
                                        <td>Your Software Version</td>
                                        <td>
                                            {darknodeDetails.nodeStatistics
                                                ? darknodeDetails.nodeStatistics
                                                      .version
                                                : ""}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Latest Version</td>
                                        <td>
                                            {latestDarknodeVersionFull
                                                ? latestDarknodeVersionFull
                                                : ""}{" "}
                                            {isDefined(upToDate) ? (
                                                upToDate ? (
                                                    <>
                                                        {" "}
                                                        -{" "}
                                                        <span className="green">
                                                            Up to date
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        {" "}
                                                        -{" "}
                                                        <ExternalLink
                                                            className="blue"
                                                            href={
                                                                UPDATE_DARKNODE_LINK
                                                            }
                                                        >
                                                            Update now
                                                        </ExternalLink>
                                                    </>
                                                )
                                            ) : (
                                                ""
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Version published</td>
                                        <td>{latestDarknodeVersionDaysAgo}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </BlockBody>
                ) : null}
            </div>
        </Block>
    );
};
