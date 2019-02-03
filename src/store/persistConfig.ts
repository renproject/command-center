import storage from "redux-persist/lib/storage";

import { createTransform, PersistConfig } from "redux-persist";

import { _captureBackgroundException_ } from "../lib/errors";
import {
    ApplicationData,
    StatisticsData
} from "./types";

// Local Storage:

const statisticsTransform = createTransform<StatisticsData, string>(
    (inboundState: StatisticsData, key: string): string => {
        try {
            return inboundState.serialize();
        } catch (error) {
            console.error(`Error serializing ${key} (${JSON.stringify(inboundState)}): ${error}`);
            _captureBackgroundException_(error, { description: "Error serializing local storage" });
            throw error;
        }
    },
    (outboundState: string, key: string): StatisticsData => {
        try {
            return new StatisticsData().deserialize(outboundState);
        } catch (error) {
            console.error(`Error deserializing ${key} (${JSON.stringify(outboundState)}): ${error}`);
            _captureBackgroundException_(error, { description: "Error deserializing local storage" });
            throw error;
        }
    },
    { whitelist: ["statistics"] as Array<keyof ApplicationData>, },
);

export const persistConfig: PersistConfig = {
    storage,
    key: "root",
    whitelist: ["statistics"] as Array<keyof ApplicationData>,
    transforms: [statisticsTransform],
};
