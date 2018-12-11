import thunk from "redux-thunk";

import { Action, applyMiddleware, createStore, Middleware, Reducer } from "redux";
import { PersistConfig, persistReducer, persistStore } from "redux-persist";

import { rootReducer } from "@Reducers/rootReducer";
import { persistConfig } from "@Store/persistConfig";

const middlewares: Middleware[] = [
    thunk,
];

// Log Redux actions (only in development)
if (process.env.NODE_ENV === "development") {
    // middlewares.push(createLogger({ collapsed: true }));
}

// Workaround createStore not liking type of persistReducer
export function typedPersistReducer<S, A extends Action>(config: PersistConfig, reducer: Reducer<S, A>) {
    return persistReducer<S | undefined, A>(
        config,
        reducer
    );
}

const persistedReducer = typedPersistReducer(persistConfig, rootReducer);

export const configureStore = () => {
    const store = createStore(persistedReducer,
        applyMiddleware(...middlewares),
    );
    const persistor = persistStore(store);
    return { store, persistor };
};
