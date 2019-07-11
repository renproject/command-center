import { Action, applyMiddleware, createStore, Middleware, Reducer } from "redux";
import { PersistConfig, PersistPartial, persistReducer, persistStore } from "redux-persist";
import thunk from "redux-thunk";

import { persistConfig } from "./persistConfig";
import { rootReducer } from "./reducers/rootReducer";

const middlewares: Middleware[] = [
    thunk,
];

// Log Redux actions (only in development)
if (process.env.NODE_ENV === "development") {
    // middlewares.push(createLogger({ collapsed: true }));
}

// Workaround createStore not liking type of persistReducer
const typedPersistReducer = <S, A extends Action>(config: PersistConfig, reducer: Reducer<S, A>):
    Reducer<S & PersistPartial, A> => {
    return persistReducer<S, A>(
        config,
        reducer
    );
};

const persistedReducer = typedPersistReducer(persistConfig, rootReducer);

export const configureStore = () => {
    const store = createStore(persistedReducer,
        applyMiddleware(...middlewares),
    );
    const persistor = persistStore(store);
    return { store, persistor };
};
