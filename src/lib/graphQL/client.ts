import { RenNetworkDetails } from "@renproject/contracts";
import ApolloClient from "apollo-boost";
import fetch from "node-fetch";

export const apolloClient = (renNetwork: RenNetworkDetails) => {
    return new ApolloClient<unknown>({
        uri: `https://api.thegraph.com/subgraphs/name/noiach/renvm${renNetwork.name === "mainnet" ? "" : `-${renNetwork.name}`}`,
        fetch: fetch as any,
    });
};
