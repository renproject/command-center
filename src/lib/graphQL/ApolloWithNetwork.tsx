import { useMemo } from "react";

import { Web3Container } from "../../store/web3Container";
import { apolloClient, bscSubgraphUrl, ethereumSubgraphUrl } from "./client";

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

    return {
        ethereumSubgraph,
        bscSubgraph,
    };
};

export const GraphClientContainer = createContainer(useGraphClientContainer);
