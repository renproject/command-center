import { useEffect, useMemo, useRef, useState } from "react";

export type StorageObj = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const fromStorage = <T>(value: string | null) => {
    return value !== null ? (JSON.parse(value) as T) : null;
};

const readItem = <T>(storage: StorageObj, key: string, unmarshalFromStorage: ((value: string | null) => T | null) = fromStorage) => {
    try {
        const storedValue = storage.getItem(key);
        return unmarshalFromStorage(storedValue);
    } catch (e) {
        return null;
    }
};

const toStorage = <T>(value: T | null) => {
    return JSON.stringify(value);
};

const writeItem = async <T>(storage: StorageObj, key: string, value: T | null, marshalToStorage: ((value: T | null) => string) = toStorage) => {
    try {
        if (value !== null) {
            storage.setItem(key, marshalToStorage(value));
        } else {
            storage.removeItem(key);
        }
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
};

export const useInitialState = <S>(
    storage: StorageObj,
    key: string,
    defaultState: S,
    unmarshalFromStorage: ((value: string | null) => S | null) = fromStorage,
) => {
    const defaultStateRef = useRef(defaultState);

    return useMemo(() => readItem<S>(storage, key, unmarshalFromStorage) ?? defaultStateRef.current, [
        key,
        storage,
    ]);
};

export const useStorageWriter = <S>(
    storage: StorageObj,
    key: string,
    state: S | null,
    marshalToStorage: ((value: S | null) => string) = toStorage,
) => {
    const [writeError, setWriteError] = useState<Error | undefined>(undefined);

    useEffect(() => {
        writeItem<S>(storage, key, state, marshalToStorage).catch((error) => {
            if (!error || !error.message || error.message !== writeError?.message) {
                setWriteError(error);
            }
        });

        if (writeError) {
            return () => {
                setWriteError(undefined);
            };
        }

        return;
    }, [state, key, writeError, storage]);

    return writeError;
};

export const useStorageListener = <S>(
    storage: StorageObj,
    key: string,
    defaultState: S,
    onChange: (newValue: S) => void,
    unmarshalFromStorage: ((value: string | null) => S | null) = fromStorage,
) => {
    const defaultStateRef = useRef(defaultState);
    const onChangeRef = useRef(onChange);

    const firstRun = useRef(true);
    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }

        onChangeRef.current(readItem<S>(storage, key, unmarshalFromStorage) ?? defaultStateRef.current);
    }, [key, storage]);

    useEffect(() => {
        const onStorageChange = (event: StorageEvent) => {
            if (event.key === key) {
                onChangeRef.current(
                    unmarshalFromStorage(event.newValue) ?? defaultStateRef.current
                );
            }
        };

        // tslint:disable-next-line: no-typeof-undefined strict-type-predicates
        if (typeof window !== "undefined") {
            window.addEventListener("storage", onStorageChange);
            return () => {
                window.removeEventListener("storage", onStorageChange);
            };
        }

        return;
    }, [key]);
};
