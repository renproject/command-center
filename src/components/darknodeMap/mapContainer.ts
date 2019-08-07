// tslint:disable: no-unused-variable

import { RenNetworkDetails, testnet } from "@renproject/contracts";
import { sleep } from "@renproject/react-components";
import Axios from "axios";
import { Map } from "immutable";
import { useState } from "react";
import { MarkerType } from "react-simple-maps";
import { createContainer } from "unstated-next";

interface City extends MarkerType {
    darknodeID: string;
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

const getLightnode = (network: RenNetworkDetails): string => {
    switch (network.name) {
        case "mainnet": return "";
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

interface Location { longitude: number; latitude: number; }

const useMapContainer = (initialState = testnet as RenNetworkDetails) => {
    // tslint:disable-next-line: prefer-const
    let [darknodes, setDarknodes] = useState(sampleDarknodes);
    // tslint:disable-next-line: whitespace
    const [network,] = useState(initialState);
    // tslint:disable-next-line: prefer-const
    let [ipMap, setIpMap] = useState(Map<string, Location>());

    const getLocation = async (ip: string): Promise<Location> => {
        // Check if we've already fetched for this IP
        const previousLocation = ipMap.get(ip);
        if (previousLocation) {
            return previousLocation;
        }

        // Store in map for next time
        const location = await fetchLocationFromAPI(ip);
        ipMap = ipMap.set(ip, location);
        setIpMap(ipMap);

        // Return location
        return location;
    };

    const addDarknodeID = async (multiAddress: string) => {
        const [, , ip, , , , darknodeID] = multiAddress.split("/");
        try {
            const { longitude, latitude } = await getLocation(ip);
            darknodes = [...darknodes, { darknodeID, coordinates: [longitude, latitude] }];
            setDarknodes(darknodes);
        } catch (error) {
            // Ignore errors
        }
    };

    const fetchDarknodes = async () => {
        const lightnode = getLightnode(network);
        if (!lightnode) {
            console.error(`No lightnode to fetch darknode locations.`);
            return;
        }
        const request = { jsonrpc: "2.0", method: "ren_queryPeers", params: {}, id: 67 };
        const response = (await Axios.post<QueryResponse>(lightnode, request)).data;
        const darknodeIDs = response.result.peers;
        const updateDarknodes = darknodeIDs.map((darknodeID: string) => (() => addDarknodeID(darknodeID)));
        await parallelLimit(updateDarknodes, 4);
    };
    return { fetchDarknodes, darknodes };
};

export const MapContainer = createContainer(useMapContainer);
