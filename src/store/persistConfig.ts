// tslint:disable: no-console

import { createTransform, PersistConfig } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { _captureBackgroundException_ } from "../lib/react/errors";
import { AccountState, ApplicationState, NetworkState } from "./applicationState";

// Local Storage:

const accountTransform = createTransform<AccountState, string>(
    (inboundState: AccountState, key: string): string => {
        try {
            return inboundState.serialize();
        } catch (error) {
            console.error(`Error serializing ${key} in AccountState (${JSON.stringify(inboundState)}): ${error}`);
            // Don't send storage because it may contain sensitive data.
            _captureBackgroundException_(error, { description: "Error serializing account storage" });
            throw error;
        }
    },
    (outboundState: string, key: string): AccountState => {
        try {
            return new AccountState().deserialize(outboundState);
        } catch (error) {
            console.error(`Error deserializing ${key} in AccountState (${JSON.stringify(outboundState)}): ${error}`);
            // Don't send storage because it may contain sensitive data.
            _captureBackgroundException_(error, { description: "Error deserializing account storage" });
            throw error;
        }
    },
    { whitelist: ["account"] as Array<keyof ApplicationState>, },
);

const networkTransform = createTransform<NetworkState, string>(
    (inboundState: NetworkState, key: string): string => {
        try {
            return inboundState.serialize();
        } catch (error) {
            console.error(`Error serializing ${key} in NetworkState (${JSON.stringify(inboundState)}): ${error}`);
            // Don't send storage because it may contain sensitive data.
            _captureBackgroundException_(error, { description: "Error serializing network storage" });
            throw error;
        }
    },
    (outboundState: string, key: string): NetworkState => {
        try {
            return new NetworkState().deserialize(outboundState);
        } catch (error) {
            console.error(`Error deserializing ${key} in NetworkState (${JSON.stringify(outboundState)}): ${error}`);
            // Don't send storage because it may contain sensitive data.
            _captureBackgroundException_(error, { description: "Error deserializing network storage" });
            throw error;
        }
    },
    { whitelist: ["network"] as Array<keyof ApplicationState>, },
);

export const persistConfig: PersistConfig = {
    storage,
    key: "root",
    whitelist: ["account", "network"] as Array<keyof ApplicationState>,
    transforms: [accountTransform, networkTransform],
};
