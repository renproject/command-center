import { sleep } from "@renproject/react-components";
import Axios from "axios";
import { useState } from "react";
import { MarkerType } from "react-simple-maps";
import { createContainer } from "unstated-next";

interface City extends MarkerType {
    darknodeID: string;
}

const sampleDarknodes: City[] = [];

interface GeoAPIResponse {
    asn: string;
    city: string;
    continent_code: string;
    country: string;
    country_calling_code: string;
    country_name: string;
    currency: string;
    in_eu: boolean;
    ip: string;
    languages: string;
    latitude: number;
    longitude: number;
    org: string;
    postal: string;
    region: string;
    region_code: string;
    timezone: string;
    utc_offset: string;
}

interface QueryResponse {
    jsonrpc: "2.0";
    id: number;
    result: {
        peers: string[];
    };
}

const lightnode = "https://lightnode-testnet.herokuapp.com";

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

const useMapContainer = () => {
    // tslint:disable-next-line: prefer-const
    let [darknodes, setDarknodes] = useState(sampleDarknodes);

    const addDarknodeID = async (multiAddress: string) => {
        const [, , ip, , , , darknodeID] = multiAddress.split("/");
        let apiResponse;
        while (!apiResponse) {
            try {
                apiResponse = (await Axios.get<GeoAPIResponse>(`https://ipapi.co/${ip}/json`)).data;
            } catch (error) {
                // Try again
                await sleep(1 * 1000);
            }
        }
        darknodes = [...darknodes, { darknodeID, coordinates: [apiResponse.longitude, apiResponse.latitude] }];
        setDarknodes(darknodes);
    };

    const fetchDarknodes = async () => {
        const request = { jsonrpc: "2.0", method: "ren_queryPeers", params: {}, id: 67 };
        const response = (await Axios.post<QueryResponse>(lightnode, request)).data;
        const darknodeIDs = response.result.peers;
        const updateDarknodes = darknodeIDs.map((darknodeID: string) => (() => addDarknodeID(darknodeID)));
        await parallelLimit(updateDarknodes, 4);
    };
    return { fetchDarknodes, darknodes };
};

export const MapContainer = createContainer(useMapContainer);
