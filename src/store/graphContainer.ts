import { useApolloClient } from "@apollo/react-hooks";
import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import Axios from "axios";

import { useTaskSchedule } from "../hooks/useTaskSchedule";
import { queryRenVM, RenVM } from "../lib/graphQL/queries/renVM";
import { catchBackgroundException } from "../lib/react/errors";
import { Web3Container } from "./web3Container";
import { subgraphEndpoint } from "../lib/graphQL/client";
import { SECONDS } from "../controllers/common/BackgroundTasks";
import moment from "moment";
import { NotificationsContainer } from "./notificationsContainer";

// If the subgraph is behind by more than 30 blocks, show a warning and fall
// back to infura for fetching rewards.
const UNSYNCED_THRESHOLD = 30;

const useGraphContainer = () => {
    const { web3, renNetwork } = Web3Container.useContainer();
    const { showSuccess, showError } = NotificationsContainer.useContainer();

    const client = useApolloClient();

    const [renVM, setRenVM] = useState<RenVM | null>(null);

    const [shownEpochNotification, setShownEpochNotification] = useState(false);
    const [shownGraphError, setShownGraphError] = useState(false);

    const updater = async () => {
        try {
            const newRenVM = await queryRenVM(client);
            setRenVM(newRenVM);

            // Get seconds since start of epoch.
            const now = moment();
            const epochStart = now.diff(
                moment(newRenVM.currentEpoch.timestamp.toNumber() * 1000),
                "s",
            );

            // Check if the epochhash is different or the epoch started less
            // than 5 minutes ago.
            const newEpoch =
                (renVM &&
                    newRenVM.currentEpoch.epochhash !==
                        renVM.currentEpoch.epochhash) ||
                epochStart < 300;

            // Show a notification about the new epoch.
            if (newEpoch && !shownEpochNotification) {
                setShownEpochNotification(true);
                showSuccess(
                    `A new epoch has just started. There are now ${newRenVM.numberOfDarknodes} darknodes registered. Darknode rewards will appear shortly.`,
                    300 * SECONDS,
                );
            }
            return { timeout: 15, result: newRenVM };
        } catch (error) {
            catchBackgroundException(error, "Error in graphStore: updater");
            if (!renVM && !shownGraphError) {
                setShownGraphError(true);
                showError("Failed to load RenVM data from subgraph.");
            }
            return { timeout: 15, result: renVM };
        }
    };

    const [fetchRenVM] = useTaskSchedule(updater);

    const [subgraphOutOfSync, setSubgraphOutOfSync] = useState(false);

    const [checkedBlock, setCheckedBlock] = useState(false);
    useEffect(() => {
        if (checkedBlock) {
            return;
        }

        setCheckedBlock(true);

        (async () => {
            try {
                const response = await Axios.post<{
                    data: { _meta: { block: { number: number } } };
                }>(subgraphEndpoint(renNetwork), {
                    query:
                        "{\n    _meta {\n      block {\n        number\n      }\n    }\n}",
                });
                const subgraphBlock = response.data.data._meta.block.number;
                const web3Block = await web3.eth.getBlockNumber();

                if (
                    subgraphBlock &&
                    web3Block &&
                    subgraphBlock < web3Block - UNSYNCED_THRESHOLD
                ) {
                    setSubgraphOutOfSync(true);
                    showError(
                        `The RenVM subgraph is ${
                            web3Block - subgraphBlock
                        } blocks behind - data may be out of date.`,
                    );
                }
            } catch (error) {
                // Ignore error;
            }
        })().catch(console.error);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkedBlock]);

    return {
        renVM,
        fetchRenVM,
        subgraphOutOfSync,
    };
};

export const GraphContainer = createContainer(useGraphContainer);
