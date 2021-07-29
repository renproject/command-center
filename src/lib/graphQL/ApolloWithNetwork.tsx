import { useMemo } from "react";
import { Web3Container } from "../../store/web3Container";
import {
    apolloClient,
    apolloClientWithCache,
    bscSubgraphUrl,
    ethereumSubgraphUrl,
    fantomSubgraphUrl,
    polygonSubgraphUrl,
    renVmTrackerUrl,
} from "./client";

import { createContainer } from "unstated-next";

const useGraphClientContainer = () => {
    const { renNetwork } = Web3Container.useContainer();
    const ethereumSubgraph = useMemo(
        () => apolloClient(ethereumSubgraphUrl(renNetwork)),
        [renNetwork],
    );

    const bscSubgraph = useMemo(
        () => apolloClient(bscSubgraphUrl(renNetwork)),
        [renNetwork],
    );

    const fantomSubgraph = useMemo(
        () => apolloClient(fantomSubgraphUrl(renNetwork)),
        [renNetwork],
    );

    const polygonSubgraph = useMemo(
        () => apolloClient(polygonSubgraphUrl(renNetwork)),
        [renNetwork],
    );

    const renVmTracker = useMemo(
        () => apolloClientWithCache(renVmTrackerUrl()),
        [],
    );

    return {
        ethereumSubgraph,
        bscSubgraph,
        fantomSubgraph,
        polygonSubgraph,
        renVmTracker,
    };
};

export const GraphClientContainer = createContainer(useGraphClientContainer);
