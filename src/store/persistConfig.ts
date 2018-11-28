import storage from "redux-persist/lib/storage";

import {
    ApplicationData,
    TraderData
} from "@Reducers/types";
import { createTransform, PersistConfig } from "redux-persist";

// Local Storage:

const traderTransform = createTransform<TraderData, string>(
    (inboundState: TraderData, key: string): string => {
        try {
            return inboundState.serialize();
        } catch (err) {
            console.error(`Error serializing ${key} (${JSON.stringify(inboundState)}): ${err}`);
            throw err;
        }
    },
    (outboundState: string, key: string): TraderData => {
        try {
            return new TraderData().deserialize(outboundState);
        } catch (err) {
            console.error(`Error deserializing ${key} (${JSON.stringify(outboundState)}): ${err}`);
            throw err;
        }
    },
    { whitelist: ["trader"] as Array<keyof ApplicationData>, },
);

export const persistConfig: PersistConfig = {
    storage,
    key: "root",
    whitelist: ["trader"] as Array<keyof ApplicationData>,
    transforms: [traderTransform],
};
