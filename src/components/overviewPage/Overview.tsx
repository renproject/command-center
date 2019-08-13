import { Loading } from "@renproject/react-components";
import React from "react";

import { Stat, Stats } from "../common/Stat";
import { DarknodeMap } from "./darknodeMap/DarknodeMap";
import { MapContainer } from "./mapContainer";

export const Overview = () => {
    const container = MapContainer.useContainer();

    return (
        <div className="overview container">
            <Stats>
                <Stat message="Darknodes online">
                    <Stats>
                        <Stat message="Online" big>{container.darknodeCount === null ? <Loading alt /> : container.darknodeCount}</Stat>
                        <Stat message="Change next epoch" big>?</Stat>
                        <Stat message="% Ren Registered" big>?%</Stat>
                    </Stats>
                </Stat>
                <Stat message="Darknode rewards">
                    <Stats>
                        <Stat message="All time total" big>$?</Stat>
                        <Stat message="24h total" big>$?</Stat>
                        <Stat message="Average monthly rewards / darknodes" highlight big>$?</Stat>
                    </Stats>
                </Stat>
            </Stats>

            <DarknodeMap />
        </div>
    );
};
