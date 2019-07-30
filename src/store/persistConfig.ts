import { createTransform, PersistConfig } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { _captureBackgroundException_ } from "../lib/react/errors";
import { ApplicationState, StatisticsState, TraderState } from "./applicationState";

// Local Storage:

const traderTransform = createTransform<TraderState, string>(
    (inboundState: TraderState, key: string): string => {
        try {
            return inboundState.serialize();
        } catch (error) {
            console.error(`Error serializing ${key} (${JSON.stringify(inboundState)}): ${error}`);
            _captureBackgroundException_(error, { description: "Error serializing local storage" });
            throw error;
        }
    },
    (outboundState: string, key: string): TraderState => {
        try {
            return new TraderState().deserialize(outboundState);
        } catch (error) {
            console.error(`Error deserializing ${key} (${JSON.stringify(outboundState)}): ${error}`);
            _captureBackgroundException_(error, { description: "Error deserializing local storage" });
            throw error;
        }
    },
    { whitelist: ["trader"] as Array<keyof ApplicationState>, },
);

const statisticsTransform = createTransform<StatisticsState, string>(
    (inboundState: StatisticsState, key: string): string => {
        try {
            return inboundState.serialize();
        } catch (error) {
            console.error(`Error serializing ${key} (${JSON.stringify(inboundState)}): ${error}`);
            _captureBackgroundException_(error, { description: "Error serializing local storage" });
            throw error;
        }
    },
    (outboundState: string, key: string): StatisticsState => {
        try {
            return new StatisticsState().deserialize(outboundState);
        } catch (error) {
            console.error(`Error deserializing ${key} (${JSON.stringify(outboundState)}): ${error}`);
            _captureBackgroundException_(error, { description: "Error deserializing local storage" });
            throw error;
        }
    },
    { whitelist: ["statistics"] as Array<keyof ApplicationState>, },
);

export const persistConfig: PersistConfig = {
    storage,
    key: "root",
    whitelist: ["statistics", "trader"] as Array<keyof ApplicationState>,
    transforms: [statisticsTransform, traderTransform],
};
