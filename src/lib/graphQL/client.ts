import { ApolloClient as ApolloClientInterface } from "@apollo/react-hooks";
import { RenNetworkDetails } from "@renproject/contracts";
import ApolloClient from "apollo-boost";
import fetch from "node-fetch";

export const ethereumSubgraphUrl = (renNetwork: RenNetworkDetails) =>
    `https://api.thegraph.com/subgraphs/name/${
        renNetwork.name === "mainnet" ||
        renNetwork.name === "testnet" ||
        renNetwork.name === "localnet"
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

export const apolloClient = (graphUrl: string) => {
    const client = new ApolloClient<unknown>({
        uri: graphUrl,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fetch: fetch as any,
    });
    client.defaultOptions.query = {
        fetchPolicy: "no-cache",
    };
    return (client as unknown) as ApolloClientInterface<object>;
};
