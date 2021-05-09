import { faBolt } from "@fortawesome/free-solid-svg-icons";
import {
    FontAwesomeIcon,
    FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import React, { useMemo } from "react";
import { Block, BlockBody, BlockTitle } from "./Block";

import { isDefined } from "../../lib/general/isDefined";
import { classNames } from "../../lib/react/className";
import { isDarknodeUpToDate } from "../../store/githubApiContainer";
import { ExternalLink } from "../ExternalLink";
import { InfoLabel } from "../infoLabel/InfoLabel";
import { StatusDot, StatusDotColor } from "../StatusDot";

const UPDATE_DARKNODE_LINK =
    "https://docs.renproject.io/darknodes/manage/updating";

export enum DarknodeConnectionStatus {
    NotRegistered = "not-registered",
    Connecting = "connecting",
    Connected = "connected",
    Bootstrapping = "bootstrapping",
    NotConnected = "not-connected",
}

interface Props {
    status: DarknodeConnectionStatus;
    darknodeVersion: string | null;
    latestVersion: string | null;
    latestVersionDaysAgo: string | null;
}

const RenderStatus: React.FC<{ status: DarknodeConnectionStatus }> = ({
    status,
}) => {
    switch (status) {
        case DarknodeConnectionStatus.NotRegistered:
            return <>Not registered</>;
        case DarknodeConnectionStatus.Connecting:
            return <>Connecting...</>;
        case DarknodeConnectionStatus.Connected:
            return <>Operational</>;
        case DarknodeConnectionStatus.NotConnected:
            return <>Unable to connect</>;
        case DarknodeConnectionStatus.Bootstrapping:
            return (
                <>
                    Bootstrapping{" "}
                    <InfoLabel>
                        Newly registered nodes can take a few hours to be seen
                        by the entire network.
                    </InfoLabel>
                </>
            );
    }
};

export const VersionBlock: React.FC<Props> = ({
    status,
    darknodeVersion,
    latestVersion,
    latestVersionDaysAgo,
}) => {
    const upToDate: boolean | null = useMemo(
        () =>
            darknodeVersion && latestVersion
                ? isDarknodeUpToDate(darknodeVersion, latestVersion)
                : null,
        [darknodeVersion, latestVersion],
    );

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
                    status === DarknodeConnectionStatus.Connected
                        ? "version-block--status--operational"
                        : "",
                )}
            >
                <StatusDot
                    color={
                        status === DarknodeConnectionStatus.Connected
                            ? StatusDotColor.Green
                            : StatusDotColor.Yellow
                    }
                    size={24}
                />
                <RenderStatus status={status} />
            </div>

            <div className="block--advanced--bottom">
                <BlockBody>
                    <div className="network-block--info">
                        <table className="darknode-info">
                            <tbody>
                                <tr>
                                    <td>Your Software Version</td>
                                    <td>{darknodeVersion || ""}</td>
                                </tr>
                                <tr>
                                    <td>Latest Version</td>
                                    <td>
                                        {latestVersion || ""}{" "}
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
                                    <td>{latestVersionDaysAgo || ""}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </BlockBody>
            </div>
        </Block>
    );
};
