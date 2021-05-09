import { Mutex } from "async-mutex";
import { useCallback, useRef } from "react";

/**
 * Memoize an async getter, with an expiry on the memoization.
 */
export const useMemoizeWithExpiry = <T>(
    getValue: () => Promise<T> | T,
    expiry: number,
    params: React.DependencyList,
): (() => Promise<T>) => {
    const mutex = useRef(new Mutex());
    const latestValueTimestamp = useRef(0);
    const latestValue = useRef<T | null>(null);

    return useCallback(
        async () =>
            (async () => {
                await mutex.current.acquire();
                const now = Date.now();
                if (
                    latestValue.current &&
                    now - latestValueTimestamp.current < expiry
                ) {
                    return latestValue.current;
                }

                const value = await getValue();
                latestValue.current = value;
                latestValueTimestamp.current = now;

                return value;
            })().finally(() => mutex.current.release()),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        params,
    );
};
