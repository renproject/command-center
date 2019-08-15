import { Loading } from "@renproject/react-components";
import { drizzleReactHooks } from "drizzle-react";
import React from "react";

import { Stat, Stats } from "../common/Stat";
import { DarknodeMap } from "./darknodeMap/DarknodeMap";
import { MapContainer } from "./mapContainer";

export const Overview = () => {
    const container = MapContainer.useContainer();
    const { useCacheCall } = drizzleReactHooks.useDrizzle();
    const numDarknodesNextEpoch = useCacheCall("DarknodeRegistry", "numDarknodesNextEpoch") || 0;
    const numDarknodes = useCacheCall("DarknodeRegistry", "numDarknodes") || 0;

    return (
        <div className="overview container">
            <Stats>
                <Stat message="Darknodes online">
                    <Stats>
                        <Stat message="Registered" big>{numDarknodes}</Stat>
                        <Stat message="Online" big>
                            {container.darknodeCount === null ? <Loading alt /> : <>
                                {container.darknodeCount}
                                <span className={["stat--children--diff", container.darknodeCount - numDarknodes >= 0 ? "green" : "red"].join(" ")}>
                                    {container.darknodeCount - numDarknodes}
                                </span>
                            </>}
                        </Stat>
                        <Stat message="Change next epoch" big>{numDarknodes - numDarknodesNextEpoch}</Stat>
                        <Stat message="% Ren Registered" big>{100 * numDarknodes / 10000}%</Stat>
                    </Stats>
                </Stat>
                <Stat message="Darknode rewards">
                    <Stats>
                        {/* <Stat message="All time total" big>$?</Stat> */}
                        <Stat message="24h total" big>$?</Stat>
                        <Stat message="Average monthly rewards / darknodes" highlight big>$?</Stat>
                    </Stats>
                </Stat>
            </Stats>

            <DarknodeMap />
        </div>
    );
};
