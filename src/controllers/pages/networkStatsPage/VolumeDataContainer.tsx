import { OrderedMap } from "immutable";
import { useCallback, useEffect, useState } from "react";
import { createContainer } from "unstated-next";

import { GraphClientContainer } from "../../../lib/graphQL/ApolloWithNetwork";
import {
    queryRenVmTracker,
    SnapshotRecords,
    TrackerVolumeType,
} from "../../../lib/graphQL/queries/renVmTracker";
import { PeriodOption } from "../../../lib/graphQL/volumes";
import { updateVolumeData } from "./VolumeData";
import { fetchTokenTotalSupply } from "../../../lib/ethereum/contractReads";
import BigNumber from "bignumber.js";

// Re-fetch the volume stats every 10 minutes. If mints and burns become more
// frequent in the future, this could be made more frequent.
const VOLUME_REFRESH_PERIOD = 10 * 60 * 1000;

type Token = string;
type Chain = string;
type Supply = number | BigNumber;

type TokenSupply = Partial<Record<Token, Supply>>;

export type TokenSupplies = Partial<Record<Chain, TokenSupply>>;

const cachedTokenSupplies = JSON.parse(localStorage.getItem("tokenSupplies") || "{}");
export const useVolumeData = () => {
    const type = TrackerVolumeType.Locked; // TODO: remove
    const { renVmTracker } = GraphClientContainer.useContainer();

    const [volumeDataMap, setVolumeDataMap] = useState(
        OrderedMap<PeriodOption, SnapshotRecords>(),
    );
    const [volumePeriod, setVolumePeriod] = useState<PeriodOption>(
        PeriodOption.ALL,
    );
    const [volumeError, setVolumeError] = useState(false);

    const volumeData = volumeDataMap.get(volumePeriod);

    useEffect(() => {
        setVolumeError(false);

        if (!volumeData) {
            queryRenVmTracker(renVmTracker, type, volumePeriod)
                .then((response: any) => {
                    setVolumeDataMap((map) =>
                        map.set(volumePeriod, response.data),
                    );
                })
                .catch((error) => {
                    console.error(error);
                    setVolumeError(true);
                });
        }

        const interval = setInterval(() => {
            queryRenVmTracker(renVmTracker, type, volumePeriod, true)
                .then((response) => {
                    setVolumeDataMap((map) =>
                        // If there's no existing entry, then don't update it
                        // since it would be an incomplete entry.
                        map.get(volumePeriod)
                            ? map.set(
                                  volumePeriod,
                                  updateVolumeData(
                                      map.get(volumePeriod),
                                      response.data,
                                  ),
                              )
                            : map,
                    );
                })
                .catch(console.error);
        }, VOLUME_REFRESH_PERIOD);

        return () => clearInterval(interval);
    }, [renVmTracker, type, volumePeriod, volumeData]);

    const [tokenSupplies, setTokenSupplies] = useState<TokenSupplies>(cachedTokenSupplies);
    (window as any).tokenSupplies = tokenSupplies;


    const setTokenSupply = useCallback((chain: Chain, token:Token, supply: Supply) => {
        setTokenSupplies(supplies => {
            const chainSupplies = supplies[chain] || {};
            const newSupplies  = {
                ...supplies,
                [chain] : {
                    ...chainSupplies,
                    [token]: supply
                }
            } as TokenSupplies;
            return newSupplies;
        })
    }, []);

    const updateTokenSupply = useCallback(async (chain: string, token: string) => {
        try {
            const supply = await fetchTokenTotalSupply(chain, token);
            setTokenSupply(chain, token, supply);
        } catch(err){
            console.error({chain, token, err});
        }
    }, [setTokenSupply]);

    const getTokenSupply = useCallback((chain: Chain, token: Token) => {
        const chainEntry = tokenSupplies[chain];
        if(chainEntry !== undefined){
            const tokenEntry = chainEntry[token];
            if (tokenEntry !== undefined){
                return new BigNumber(tokenEntry);
            }
            return null;
        }
        return null;
    }, [tokenSupplies]);

    const persistTokenSupplies = useCallback(() => {
        localStorage.setItem("tokenSupplies", JSON.stringify(tokenSupplies));
    },[tokenSupplies]);

    return {
        allVolumeData: volumeDataMap.get(PeriodOption.ALL),
        volumeData,
        volumeLoading: !volumeData,
        volumeError: volumeError && !volumeData,
        volumePeriod,
        setVolumePeriod,
        tokenSupplies,
        getTokenSupply,
        setTokenSupply,
        updateTokenSupply,
        persistTokenSupplies
    };
};

export const VolumeDataContainer = createContainer(useVolumeData);
