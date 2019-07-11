import { createTransform, PersistConfig } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { _captureBackgroundException_ } from "../lib/errors";
import { ApplicationData, StatisticsData, TraderData } from "./types";

// Local Storage:

const traderTransform = createTransform<TraderData, string>(
    (inboundState: TraderData, key: string): string => {
        try {
            return inboundState.serialize();
        } catch (error) {
            console.error(`Error serializing ${key} (${JSON.stringify(inboundState)}): ${error}`);
            _captureBackgroundException_(error, { description: "Error serializing local storage" });
            throw error;
        }
    },
    (outboundState: string, key: string): TraderData => {
        try {
            return new TraderData().deserialize(outboundState);
        } catch (error) {
            console.error(`Error deserializing ${key} (${JSON.stringify(outboundState)}): ${error}`);
            _captureBackgroundException_(error, { description: "Error deserializing local storage" });
            throw error;
        }
    },
    { whitelist: ["trader"] as Array<keyof ApplicationData>, },
);

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
    whitelist: ["statistics", "trader"] as Array<keyof ApplicationData>,
    transforms: [statisticsTransform, traderTransform],
};
