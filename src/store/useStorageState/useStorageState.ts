// Forked from https://github.com/soyguijarro/react-storage-hooks

import { Dispatch, SetStateAction, useState } from "react";

import {
    StorageObj,
    useInitialState,
    useStorageListener,
    useStorageWriter,
} from "./common";

const useStorageState = <S>(
    storage: StorageObj,
    key: string,
    defaultState: S | (() => S) | null = null,
    unmarshalFromStorage?: (value: string | null) => S | null,
    marshalToStorage?: (value: S | null) => string,
): [S, Dispatch<SetStateAction<S | null>>, Error | undefined] => {
    const [state, setState] = useState(
        useInitialState(storage, key, defaultState, unmarshalFromStorage),
    );

    useStorageListener(
        storage,
        key,
        defaultState,
        setState,
        unmarshalFromStorage,
    );
    const writeError = useStorageWriter(storage, key, state, marshalToStorage);

    return [state as S, setState, writeError];
};

export default useStorageState;
