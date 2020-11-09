import { useCallback, useEffect, useState } from "react";

const SECONDS = 1000;
const time = (): number => Math.floor(new Date().getTime() / SECONDS);

type ReturnResult<T> = number | { timeout: number; result: T };

// tslint:disable-next-line: no-any
export const useTaskSchedule = <T = undefined>(
  task: () => ReturnResult<T> | Promise<ReturnResult<T>>,
  extraDependencies: any[] = [],
  errorTimeout = 1,
) => {
  const now = time();
  const [, rerender] = useState(true);

  const [lastUpdated, setLastUpdated] = useState(0);
  const [loopTimeout, setLoopTimeout] = useState(errorTimeout);
  const shouldUpdated = now - lastUpdated >= loopTimeout;

  const scheduleNextCall = useCallback(
    (nextTimeout: number) => {
      setLastUpdated(time());
      setLoopTimeout(nextTimeout);
      setTimeout(
        () => rerender((currentR) => !currentR),
        nextTimeout * SECONDS,
      );
    },
    [setLastUpdated, setLoopTimeout, rerender],
  );

  const runTask = useCallback(async (): Promise<T> => {
    const timeout: ReturnResult<T> = await task();
    if (typeof timeout === "number") {
      scheduleNextCall(timeout);
      return (undefined as unknown) as T;
    } else {
      scheduleNextCall(timeout.timeout);
      return timeout.result;
    }
  }, [task, scheduleNextCall]);

  // Reset last updated if the dependencies have changed.
  useEffect(() => {
    setLastUpdated(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, extraDependencies);

  useEffect(() => {
    if (!shouldUpdated) {
      return;
    }

    (async () => {
      await runTask();
    })().catch(() => {
      scheduleNextCall(errorTimeout);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldUpdated]);

  return [runTask];
};
