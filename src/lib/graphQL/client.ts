import { RenNetworkDetails } from "@renproject/contracts";
import ApolloClient from "apollo-boost";
import fetch from "node-fetch";

export const apolloClient = (renNetwork: RenNetworkDetails) => {
    const client = new ApolloClient<unknown>({
        uri: `https://api.thegraph.com/subgraphs/name/${
            renNetwork.name === "mainnet" || renNetwork.name === "testnet"
                ? "renproject"
                : "noiach"
        }/renvm${renNetwork.name === "mainnet" ? "" : `-${renNetwork.name}`}`,
        // tslint:disable-next-line: no-any
        fetch: fetch as any,
    });
    client.defaultOptions.query = {
        fetchPolicy: "no-cache",
    };
    return client;
};
