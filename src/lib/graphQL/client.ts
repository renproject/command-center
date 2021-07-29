import { ApolloClient as ApolloClientInterface } from "@apollo/react-hooks";
import { RenNetworkDetails } from "@renproject/contracts";
import ApolloClient from "apollo-boost";
import { InMemoryCache, defaultDataIdFromObject } from "apollo-cache-inmemory";
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
export const renVmTrackerUrl = () => {
    return `https://renvm-tracker.herokuapp.com/`;
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
    return (client as unknown) as ApolloClientInterface<object>;
};

const cacheByTimestamp = (
    timestamp: number | string,
    timeResolution: number,
) => {
    return Math.floor(Number(timestamp) / timeResolution);
};

const snapshotCacheId = (snapshot: any) => {
    if (snapshot.locked) {
        console.log("ssl", snapshot);
        return `Snapshot:locked:${cacheByTimestamp(snapshot.timestamp, 7200)}`;
    }
    // else if (snapshot.volume) {
    //     // console.log("ssv", snapshot);
    //     return null;
    //     // return `Snapshot:volume:${snapshot.id}:${cacheByTimestamp(
    //     //     snapshot.timestamp,
    //     //     60,
    //     // )}`;
    // }
    // } else if (snapshot.prices) {
    //     return `Snapshot:prices:${cacheByTimestamp(snapshot.timestamp, 120)}`;
    // }
    return defaultDataIdFromObject(snapshot);
};

export const apolloClientWithCache = (graphUrl: string) => {
    const client = new ApolloClient<unknown>({
        uri: graphUrl,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fetch: fetch as any,
        cache: new InMemoryCache({
            dataIdFromObject: defaultDataIdFromObject,
            // addTypename: true,
            // dataIdFromObject: (object) => {
            //     // console.log(object.__typename);
            //     switch (object.__typename) {
            //         case "Snapshot":
            //             return snapshotCacheId(object);
            //         default:
            //             return defaultDataIdFromObject(object);
            //     }
            // },
        }),
    });
    client.defaultOptions.query = {
        fetchPolicy: "cache-first",
    };
    return (client as unknown) as ApolloClientInterface<object>;
};
