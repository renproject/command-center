import { ApolloClient as ApolloClientInterface } from "@apollo/react-hooks";
import { RenNetworkDetails } from "@renproject/contracts";
import ApolloClient from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import fetch from "node-fetch";

export const ethereumSubgraphUrl = (renNetwork: RenNetworkDetails) =>
    `https://api.thegraph.com/subgraphs/name/${
        renNetwork.name === "mainnet" || renNetwork.name === "testnet"
            ? "renproject"
            : "noiach"
    }/renvm${renNetwork.name === "mainnet" ? "" : `-${renNetwork.name}`}`;

export const bscSubgraphUrl = (renNetwork: RenNetworkDetails) =>
    `https://bsc-graph${
        renNetwork.name === "mainnet" ? "" : "-testnet"
    }.renproject.io/subgraphs/name/renproject/renvm${
        renNetwork.name === "mainnet" ? "" : `-${renNetwork.name}`
    }`;

export const fantomSubgraphUrl = (renNetwork: RenNetworkDetails) =>
    `https://api.thegraph.com/subgraphs/name/renproject/renvm${
        renNetwork.name === "mainnet" ? "-fantom" : `-fantom-testnet`
    }`;

export const polygonSubgraphUrl = (renNetwork: RenNetworkDetails) => {
    return `https://api.thegraph.com/subgraphs/name/renproject/renvm${
        renNetwork.name === "mainnet" ? "-polygon" : `-polygon-testnet`
    }`;
};

// TODO: make network dependant
export const renVmTrackerUrl = (renNetwork: RenNetworkDetails) => {
    return renNetwork.name === "mainnet"
        ? `https://stats.renproject.io/`
        : `https://stats-testnet.renproject.io/`;
};

export const apolloClient = (graphUrl: string, cache?: any) => {
    const client = new ApolloClient<unknown>({
        uri: graphUrl,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fetch: fetch as any,
        cache: cache,
    });
    client.defaultOptions.query = {
        fetchPolicy: "no-cache",
    };
    return client as unknown as ApolloClientInterface<object>;
};

export const apolloClientWithCache = (graphUrl: string) => {
    const client = new ApolloClient<unknown>({
        uri: graphUrl,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fetch: fetch as any,
        cache: new InMemoryCache(),
    });
    client.defaultOptions.query = {
        fetchPolicy: "cache-first",
    };
    return client as unknown as ApolloClientInterface<object>;
};
