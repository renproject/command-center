import { ApolloClient as ApolloClientInterface } from "@apollo/react-hooks";
import { RenNetworkDetails } from "@renproject/contracts";
import ApolloClient from "apollo-boost";
import fetch from "node-fetch";

export const subgraphEndpoint = (renNetwork: RenNetworkDetails) =>
    `https://api.thegraph.com/subgraphs/name/${
        renNetwork.name === "mainnet" || renNetwork.name === "testnet"
            ? "renproject"
            : "noiach"
    }/renvm${renNetwork.name === "mainnet" ? "" : `-${renNetwork.name}`}`;

export const apolloClient = (renNetwork: RenNetworkDetails) => {
    const client = new ApolloClient<unknown>({
        uri: subgraphEndpoint(renNetwork),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fetch: fetch as any,
    });
    client.defaultOptions.query = {
        fetchPolicy: "no-cache",
    };
    return (client as unknown) as ApolloClientInterface<object>;
};
