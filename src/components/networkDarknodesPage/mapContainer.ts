// tslint:disable: no-unused-variable

import { RenNetworkDetails, testnet } from "@renproject/contracts";
import { sleep } from "@renproject/react-components";
import Axios from "axios";
import localforage from "localforage";
import { useState } from "react";
import { Point } from "react-simple-maps";
import { createContainer } from "unstated-next";

import { retryNTimes } from "../renvmPage/renvmContainer";

interface City {
    darknodeID: string;
    point: Point;
}

const sampleDarknodes: City[] = [];

interface QueryResponse {
    jsonrpc: "2.0";
    id: number;
    result: {
        peers: string[];
    };
}

// tslint:disable-next-line: no-any
const parallelLimit = <T>(promiseFactories: Array<() => Promise<T>>, limit: number): any => {
    const result: T[] = [];
    let cnt = 0;

    // tslint:disable-next-line: no-any
    const chain = (innerPromiseFactories: Array<() => Promise<T>>): any => {
        if (!innerPromiseFactories.length) { return; }
        const i = cnt++; // preserve order in result
        // tslint:disable-next-line: no-non-null-assertion
        return innerPromiseFactories.shift()!().then((res) => {
            result[i] = res; // save result
            return chain(innerPromiseFactories); // append next promise
        });
    };

    const arrChains = [];
    while (limit-- > 0 && promiseFactories.length > 0) {
        // create `limit` chains which run in parallel
        arrChains.push(chain(promiseFactories));
    }

    // return when all arrChains are finished
    return Promise.all(arrChains).then(() => result);
};

export const getLightnode = (network: RenNetworkDetails): string => {
    switch (network.name) {
        case "mainnet": return "";
        case "chaosnet": return "https://lightnode-chaosnet.herokuapp.com";
        case "testnet": return "https://lightnode-testnet.herokuapp.com";
        case "devnet": return "https://lightnode-devnet.herokuapp.com";
        case "localnet": return "";
    }
    return "";
};

const fetchLocationFromAPI = async (ip: string): Promise<Location> => {
    let limit = 2;
    while (limit) {
        try {
            const apiResponse = (await Axios.get<{
                latitude: number;
                longitude: number;
            }>(`https://ipapi.co/${ip}/json`)).data;
            return { longitude: apiResponse.longitude, latitude: apiResponse.latitude };
        } catch (error) {
            try {
                const apiResponse = (await Axios.get<{
                    lat: number;
                    lon: number;
                    // tslint:disable-next-line: no-http-string
                }>(`http://ip-api.com/json/${ip}`)).data;
                return { longitude: apiResponse.lon, latitude: apiResponse.lat };

                // Seems to share a rate-limiter with https://ipapi.co.
                // const apiResponse = (await Axios.get<{
                //     loc: string,
                // }>(`https://ipinfo.io/${ip}/json`)).data;
                // const [latitude, longitude] = apiResponse.loc.split(",").map((x) => parseInt(x));
                // return { longitude, latitude };
            } catch (error) {
                // Try again
            }
        }
        limit--;
        await sleep(1 * 1000);
    }
    throw new Error(`Unable to fetch location for ${ip}`);
};

const parseMultiAddress = (multiAddress: string): { ip: string, darknodeID: string } => {
    const [, , ip, , , , darknodeID] = multiAddress.split("/");
    return { ip, darknodeID };
};

const getAllDarknodes = async (network: RenNetworkDetails) => {
    const lightnode = getLightnode(network);
    if (!lightnode) {
        throw new Error(`No lightnode to fetch darknode locations.`);
    }
    const request = { jsonrpc: "2.0", method: "ren_queryPeers", params: {}, id: 67 };
    const response = (await retryNTimes(async () => await Axios.post<QueryResponse>(lightnode, request), 5)).data;
    return response.result.peers;
    // return darknodeIDs.map(parseMultiAddress);
};

interface Location { longitude: number; latitude: number; }

const configureCache = (): LocalForage => {
    return localforage.createInstance({
        name: "command-center",
        version: 1.0,
        storeName: "geoip",
        description: "Cache API requests to resolve IP address's coordinates",
    });
};

const writeCache = async (ip: string, location: Location) => {
    await configureCache().setItem(ip, location);
};

const readCache = async (ip: string) => {
    return await configureCache().getItem<Location>(ip);
};

const useMapContainer = (initialState = testnet as RenNetworkDetails) => {
    // tslint:disable-next-line: prefer-const
    let [darknodes, setDarknodes] = useState(sampleDarknodes);
    // tslint:disable-next-line: prefer-const
    let [darknodeCount, setDarknodeCount] = useState<number | null>(null);
    // tslint:disable-next-line: whitespace
    const [network,] = useState(initialState);
    const getLocation = async (ip: string): Promise<Location> => {
        // Check if we've already fetched for this IP
        const previousLocation = await readCache(ip);
        if (previousLocation) {
            return previousLocation;
        }

        const location = await fetchLocationFromAPI(ip);

        // Store in map for next time
        await writeCache(ip, location);

        // Return location
        return location;
    };

    const addDarknodeID = async (multiAddress: string) => {
        const { ip, darknodeID } = parseMultiAddress(multiAddress);
        try {
            const { longitude, latitude } = await getLocation(ip);
            darknodes = [...darknodes, { darknodeID, point: [longitude, latitude] }];
            setDarknodes(darknodes);
        } catch (error) {
            // Ignore errors
        }
    };

    const fetchDarknodes = async () => {
        try {
            const darknodeIDs = await getAllDarknodes(network);
            darknodeCount = darknodeIDs.length;
            setDarknodeCount(darknodeCount);
            const updateDarknodes = darknodeIDs.map((darknodeID: string) => (() => addDarknodeID(darknodeID)));
            await parallelLimit(updateDarknodes, 4);
        } catch (error) {
            console.error(error);
        }
    };
    return { fetchDarknodes, darknodes, darknodeCount };
};

export const MapContainer = createContainer(useMapContainer);
