import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";

import { retryNTimes } from "../components/renvmPage/renvmContainer";
import { getDarknodeRegistry } from "../lib/ethereum/contract";
import { catchBackgroundException, LocalError } from "../lib/react/errors";
import { Web3Container } from "./web3Store";

interface Epoch {
    epochhash: string;
    blocktime: string;
}

const time = () => Math.floor(new Date().getTime() / 1000);
const everyNSeconds = (loaded: number, now: number, n: number) => Math.floor((now - loaded)) % n === 0;
const inNSeconds = (loaded: number, now: number, n: number) => (n - ((now - loaded) % n)) * 1000;

const useEpochContainer = () => {
    const { renNetwork: network, web3 } = Web3Container.useContainer();
    const now = time();

    const [loaded,] = useState(now);
    const [r, rerender] = useState(true);

    const [epoch, setEpoch] = useState(null as Epoch | null);
    const [epochInterval, setEpochInterval] = useState(null as number | null);
    const [timeUntilNextEpoch, setTimeUntilNextEpoch] = useState(null as number | null);
    const [timeSinceLastEpoch, setTimeSinceLastEpoch] = useState(null as number | null);

    // tslint:disable-next-line: prefer-const
    let [loopTimeout, setLoopTimeout] = useState(200); // Update every 200 seconds
    const loopTrigger = everyNSeconds(loaded, now, loopTimeout);

    useEffect(() => {
        let nextLoopTimeout = 1;
        (async () => {
            if (network && web3) {
                nextLoopTimeout = 200;
                try {
                    const darknodeRegistry = getDarknodeRegistry(web3, network);
                    const newEpoch: Epoch = await retryNTimes(async () => await darknodeRegistry.methods.currentEpoch().call(), 2);
                    if (!newEpoch) {
                        throw new LocalError("currentEpoch returned null");
                    }
                    const newEpochInterval = new BigNumber(await retryNTimes(async () => await darknodeRegistry.methods.minimumEpochInterval().call(), 2)).toNumber();
                    setEpoch(newEpoch);
                    setEpochInterval(newEpochInterval);

                    const newEpochTimestamp = (new BigNumber(newEpoch.blocktime.toString())).toNumber();
                    const newTimeUntilNextEpoch = Math.max(newEpochInterval - (now - newEpochTimestamp), 0);
                    setTimeUntilNextEpoch(newTimeUntilNextEpoch);

                    const newTimeSinceLastEpoch = Math.max(now - newEpochTimestamp, 0);
                    setTimeSinceLastEpoch(newTimeSinceLastEpoch);
                } catch (error) {
                    nextLoopTimeout = 10;
                    catchBackgroundException(error, "Error in EpochContainer: fetchEpoch");
                }
            }
            setLoopTimeout(nextLoopTimeout);
            setTimeout(() => rerender(!r), inNSeconds(loaded, now, nextLoopTimeout));
        })().catch(error => {
            setLoopTimeout(nextLoopTimeout);
            setTimeout(() => rerender(!r), inNSeconds(loaded, now, nextLoopTimeout));
            catchBackgroundException(error, "Error in epochStore: useEffect > fetchEpoch");
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [web3, loopTrigger]);

    return { epoch, timeUntilNextEpoch, epochInterval, timeSinceLastEpoch };
};

export const EpochContainer = createContainer(useEpochContainer);
