import { useMemo } from "react";

import { Web3Container } from "../../store/web3Container";
import {
    apolloClient,
    bscSubgraphUrl,
    ethereumSubgraphUrl,
    fantomSubgraphUrl,
    polygonSubgraphUrl,
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

    return {
        ethereumSubgraph,
        bscSubgraph,
        fantomSubgraph,
        polygonSubgraph,
    };
};

export const GraphClientContainer = createContainer(useGraphClientContainer);
