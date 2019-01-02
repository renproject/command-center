import storage from "redux-persist/lib/storage";

import {
    ApplicationData,
    StatisticsData
} from "../reducers/types";
import { createTransform, PersistConfig } from "redux-persist";

// Local Storage:

const statisticsTransform = createTransform<StatisticsData, string>(
    (inboundState: StatisticsData, key: string): string => {
        try {
            return inboundState.serialize();
        } catch (err) {
            console.error(`Error serializing ${key} (${JSON.stringify(inboundState)}): ${err}`);
            throw err;
        }
    },
    (outboundState: string, key: string): StatisticsData => {
        try {
            return new StatisticsData().deserialize(outboundState);
        } catch (err) {
            console.error(`Error deserializing ${key} (${JSON.stringify(outboundState)}): ${err}`);
            throw err;
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
