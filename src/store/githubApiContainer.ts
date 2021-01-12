import { naturalTime } from "@renproject/react-components";
import Axios from "axios";
import moment from "moment";
import { useCallback, useState } from "react";
import semver from "semver";
import { createContainer } from "unstated-next";

import { retryNTimes } from "../controllers/pages/renvmStatsPage/renvmContainer";
import { useTaskSchedule } from "../hooks/useTaskSchedule";
import { DEFAULT_REQUEST_TIMEOUT } from "../lib/react/environmentVariables";
import { catchBackgroundException } from "../lib/react/errors";

const DARKNODE_ENDPOINT =
    "https://api.github.com/repos/renproject/darknode-release/releases/latest";
const DARKNODE_CLI_ENDPOINT =
    "https://api.github.com/repos/renproject/darknode-cli/releases/latest";

const API_LIMIT_ERROR = /API rate limit exceeded/;

const useGithubAPIContainer = () => {
    const [latestDarknodeVersionFull, setLatestDarknodeVersionFull] = useState(
        null as string | null,
    );
    const [latestDarknodeVersion, setLatestDarknodeVersion] = useState(
        null as string | null,
    );
    const [
        latestDarknodeVersionDaysAgo,
        setLatestDarknodeVersionDaysAgo,
    ] = useState(null as string | null);

    const [latestCLIVersionFull, setLatestCLIVersionFull] = useState(
        null as string | null,
    );
    const [latestCLIVersion, setLatestCLIVersion] = useState(
        null as string | null,
    );
    const [latestCLIVersionDaysAgo, setLatestCLIVersionDaysAgo] = useState(
        null as string | null,
    );

    const HOUR = 60 * 60;

    const updater = async () => {
        let interval = 0.5 * HOUR;

        try {
            const response = await retryNTimes(
                () =>
                    Axios.get<VersionResponse | VersionError>(
                        DARKNODE_ENDPOINT,
                        {
                            timeout: DEFAULT_REQUEST_TIMEOUT,
                        },
                    ),
                2,
            );

            if (!response.data || response.data.message) {
                throw new Error(
                    response.data
                        ? response.data.message
                        : "No data returned from Github API.",
                );
            }

            setLatestDarknodeVersionFull(
                response.data.tag_name.replace(/-testnet/, " (prerelease)"),
            );
            setLatestDarknodeVersion(response.data.tag_name);

            setLatestDarknodeVersionDaysAgo(
                naturalTime(moment(response.data.published_at).unix(), {
                    suffix: "ago",
                    message: "Just now",
                    countDown: false,
                    showingSeconds: false,
                }),
            );
        } catch (error) {
            if (
                error &&
                error.message &&
                error.message.match &&
                error.message.match(API_LIMIT_ERROR)
            ) {
                interval = 2 * HOUR;
            } else {
                catchBackgroundException(
                    error,
                    "Error in GithubAPIContainer: fetchEpoch",
                );
                interval = 30;
            }
        }

        try {
            const response = await retryNTimes(
                () =>
                    Axios.get<VersionResponse | VersionError>(
                        DARKNODE_CLI_ENDPOINT,
                        {
                            timeout: DEFAULT_REQUEST_TIMEOUT,
                        },
                    ),
                2,
            );

            if (!response.data || response.data.message) {
                throw new Error(
                    response.data
                        ? response.data.message
                        : "No data returned from Github API.",
                );
            }

            setLatestCLIVersionFull(response.data.tag_name);
            setLatestCLIVersion(response.data.tag_name);

            setLatestCLIVersionDaysAgo(
                naturalTime(moment(response.data.published_at).unix(), {
                    suffix: "ago",
                    message: "Just now",
                    countDown: false,
                    showingSeconds: false,
                }),
            );
        } catch (error) {
            if (
                error &&
                error.message &&
                error.message.match &&
                error.message.match(API_LIMIT_ERROR)
            ) {
                interval = 2 * HOUR;
            } else {
                catchBackgroundException(
                    error,
                    "Error in GithubAPIContainer: fetchEpoch",
                );
                interval = 30;
            }
        }

        return interval;
    };

    useTaskSchedule(updater);

    const isDarknodeUpToDate = useCallback(
        (darknodeVersionFull: string) => {
            try {
                return latestDarknodeVersionFull
                    ? semver.gte(
                          darknodeVersionFull.split("-")[0],
                          latestDarknodeVersionFull,
                      )
                    : null;
            } catch (error) {
                console.error(error);
                return null;
            }
        },

        [latestDarknodeVersionFull],
    );

    const isCLIUpToDate = useCallback(
        (cliVersionFull: string) => {
            try {
                return latestCLIVersionFull
                    ? semver.gte(
                          cliVersionFull.split("-")[0],
                          latestCLIVersionFull,
                      )
                    : null;
            } catch (error) {
                console.error(error);
                return null;
            }
        },

        [latestCLIVersionFull],
    );

    return {
        latestDarknodeVersion,
        latestDarknodeVersionFull,
        latestDarknodeVersionDaysAgo,
        latestCLIVersion,
        latestCLIVersionFull,
        latestCLIVersionDaysAgo,
        isDarknodeUpToDate,
        isCLIUpToDate,
    };
};

export const GithubAPIContainer = createContainer(useGithubAPIContainer);

interface Author {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
}

interface Uploader {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
}

interface Asset {
    url: string;
    id: number;
    node_id: string;
    name: string;
    label?: unknown;
    uploader: Uploader;
    content_type: string;
    state: string;
    size: number;
    download_count: number;
    created_at: Date;
    updated_at: Date;
    browser_download_url: string;
}

interface VersionResponse {
    url: string;
    assets_url: string;
    upload_url: string;
    html_url: string;
    id: number;
    node_id: string;
    tag_name: string;
    target_commitish: string;
    name: string;
    draft: boolean;
    author: Author;
    prerelease: boolean;
    created_at: Date;
    published_at: Date;
    assets: Asset[];
    tarball_url: string;
    zipball_url: string;
    body: string;

    message: undefined;
}

interface VersionError {
    message: "Not Found";
    documentation_url: "https://developer.github.com/v3/repos/releases/#get-a-single-release";
}
