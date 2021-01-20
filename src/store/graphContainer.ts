import { useApolloClient } from "@apollo/react-hooks";
import Axios from "axios";
import { useEffect, useRef, useState } from "react";
import { createContainer } from "unstated-next";

import { SECONDS } from "../controllers/common/BackgroundTasks";
import { useMemoizeWithExpiry } from "../hooks/useMemoizeWithExpiry";
import { useTaskSchedule } from "../hooks/useTaskSchedule";
import { subgraphEndpoint } from "../lib/graphQL/client";
import { queryRenVM, RenVM } from "../lib/graphQL/queries/renVM";
import { catchBackgroundException } from "../lib/react/errors";
import { NotificationsContainer } from "./notificationsContainer";
import { Web3Container } from "./web3Container";

// If the subgraph is behind by more than 30 blocks, show a warning and fall
// back to infura for fetching rewards.
const UNSYNCED_THRESHOLD = 30;

const useGraphContainer = () => {
    const { web3, renNetwork } = Web3Container.useContainer();
    const {
        showSuccess,
        showError,
        showHint,
    } = NotificationsContainer.useContainer();

    const client = useApolloClient();

    const [renVM, setRenVM] = useState<RenVM | null>(null);

    const shownEpochNotification = useRef(false);
    const shownGraphError = useRef(false);

    const updater = async () => {
        try {
            const newRenVM = await queryRenVM(client);
            setRenVM(newRenVM);

            // Get seconds since start of epoch.
            const epochStart =
                Date.now() / 1000 - newRenVM.currentEpoch.timestamp.toNumber();

            // Check if the epochhash is different or the epoch started less
            // than 5 minutes ago.
            const newEpoch =
                (renVM &&
                    newRenVM.currentEpoch.epochhash !==
                        renVM.currentEpoch.epochhash) ||
                epochStart < 600;

            // Show a notification about the new epoch.
            if (newEpoch && !shownEpochNotification.current) {
                shownEpochNotification.current = true;
                const darknodeCount = newRenVM.numberOfDarknodes.toFixed
                    ? newRenVM.numberOfDarknodes.toFixed()
                    : newRenVM.numberOfDarknodes.toString();
                showSuccess(
                    `A new epoch has just started. There are now ${darknodeCount} darknodes registered. Darknode rewards will appear shortly.`,
                    30 * SECONDS,
                );
            }
            return { timeout: 15, result: newRenVM };
        } catch (error) {
            catchBackgroundException(error, "Error in graphStore: updater");
            if (!renVM && !shownGraphError.current) {
                shownGraphError.current = true;
                showError("Failed to load RenVM data from subgraph.");
            }
            return { timeout: 15, result: renVM };
        }
    };

    const [fetchRenVM] = useTaskSchedule(updater);

    const getLatestSyncedBlock = useMemoizeWithExpiry(
        async () =>
            Axios.post<{
                // eslint-disable-next-line id-blacklist
                data: { _meta: { block: { number: number } } };
            }>(subgraphEndpoint(renNetwork), {
                query:
                    "{\n    _meta {\n      block {\n        number\n      }\n    }\n}",
            }).then((response) => response.data.data._meta.block.number),
        60 * SECONDS,
        [renNetwork],
    );

    const [subgraphOutOfSync, setSubgraphOutOfSync] = useState(false);

    const [checkedBlock, setCheckedBlock] = useState(false);
    useEffect(() => {
        if (checkedBlock) {
            return;
        }

        setCheckedBlock(true);

        (async () => {
            try {
                const subgraphBlock = await getLatestSyncedBlock();
                const web3Block = await web3.eth.getBlockNumber();

                if (
                    subgraphBlock &&
                    web3Block &&
                    subgraphBlock < web3Block - UNSYNCED_THRESHOLD
                ) {
                    setSubgraphOutOfSync(true);
                    showHint(
                        `The RenVM subgraph is ${
                            web3Block - subgraphBlock
                        } blocks behind - data may be out of date. New epochs can take a few hours to process.`,
                        0,
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
        getLatestSyncedBlock,
    };
};

export const GraphContainer = createContainer(useGraphContainer);
