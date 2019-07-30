import { createTransform, PersistConfig } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { _captureBackgroundException_ } from "../lib/react/errors";
import { AccountState, ApplicationState, StatisticsState } from "./applicationState";

// Local Storage:

const accountTransform = createTransform<AccountState, string>(
    (inboundState: AccountState, key: string): string => {
        try {
            return inboundState.serialize();
        } catch (error) {
            console.error(`Error serializing ${key} (${JSON.stringify(inboundState)}): ${error}`);
            _captureBackgroundException_(error, { description: "Error serializing local storage" });
            throw error;
        }
    },
    (outboundState: string, key: string): AccountState => {
        try {
            return new AccountState().deserialize(outboundState);
        } catch (error) {
            console.error(`Error deserializing ${key} (${JSON.stringify(outboundState)}): ${error}`);
            _captureBackgroundException_(error, { description: "Error deserializing local storage" });
            throw error;
        }
    },
    { whitelist: ["account"] as Array<keyof ApplicationState>, },
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
    whitelist: ["account", "statistics"] as Array<keyof ApplicationState>,
    transforms: [accountTransform, statisticsTransform],
};
