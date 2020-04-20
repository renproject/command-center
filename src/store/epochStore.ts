// tslint:disable: no-unused-variable

import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";

import { retryNTimes } from "../components/renvmPage/renvmContainer";
import { getDarknodeRegistry } from "../lib/ethereum/contract";
import { _catchBackgroundException_ } from "../lib/react/errors";
import { Web3Container } from "./web3Store";

interface Epoch {
    epochhash: string;
    blocktime: string;
}

const time = () => Math.floor(new Date().getTime() / 1000);
const everyNSeconds = (loaded: number, now: number, n: number) => Math.floor((now - loaded)) % n === 0;
const inNSeconds = (loaded: number, now: number, n: number) => (n - ((now - loaded) % n)) * 1000;

const useEpochContainer = () => {
    const { network, web3 } = Web3Container.useContainer();
    const now = time();

    const [loaded,] = useState(now);
    const [r, rerender] = useState(true);

    const [epoch, setEpoch] = useState(null as Epoch | null);
    const [epochInterval, setEpochInterval] = useState(null as number | null);
    const [timeUntilNextEpoch, setTimeUntilNextEpoch] = useState(null as number | null);
    const [timeSinceLastEpoch, setTimeSinceLastEpoch] = useState(null as number | null);

    // tslint:disable-next-line: prefer-const
    let [loopTimeout, setLoopTimeout] = useState(200); // Update every 200 seconds

    useEffect(() => {
        (async () => {
            if (network && web3) {
                try {
                    loopTimeout = 200;
                    setLoopTimeout(loopTimeout);
                    const darknodeRegistry = getDarknodeRegistry(web3, network);
                    const newEpoch: Epoch = await retryNTimes(async () => await darknodeRegistry.methods.currentEpoch().call(), 5);
                    const newEpochInterval = new BigNumber(await retryNTimes(async () => await darknodeRegistry.methods.minimumEpochInterval().call(), 5)).toNumber();
                    setEpoch(newEpoch);
                    setEpochInterval(newEpochInterval);

                    const newEpochTimestamp = (new BigNumber(newEpoch.blocktime.toString())).toNumber();
                    const newTimeUntilNextEpoch = Math.max(newEpochInterval - (now - newEpochTimestamp), 0);
                    setTimeUntilNextEpoch(newTimeUntilNextEpoch);

                    const newTimeSinceLastEpoch = Math.max(now - newEpochTimestamp, 0);
                    setTimeSinceLastEpoch(newTimeSinceLastEpoch);
                } catch (error) {
                    loopTimeout = 10;
                    setLoopTimeout(loopTimeout);
                    _catchBackgroundException_(error, "Error in EpochContainer: fetchEpoch");
                }
            } else {
                loopTimeout = 1;
                setLoopTimeout(loopTimeout);
            }
            setTimeout(() => rerender(!r), inNSeconds(loaded, now, loopTimeout));
        })().catch(error => {
            setTimeout(() => rerender(!r), inNSeconds(loaded, now, loopTimeout));
            _catchBackgroundException_(error, "Error in epochStore: useEffect > fetchEpoch");
        });
    }, [web3, everyNSeconds(loaded, now, loopTimeout)]);

    return { epoch, timeUntilNextEpoch, epochInterval, timeSinceLastEpoch };
};

export const EpochContainer = createContainer(useEpochContainer);
