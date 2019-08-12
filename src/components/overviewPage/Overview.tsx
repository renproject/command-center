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
                        <Stat message="Online">{container.darknodeCount === null ? <Loading alt={true} /> : container.darknodeCount}</Stat>
                        <Stat message="Changes next epoch">?</Stat>
                        <Stat message="% Ren Registered">?%</Stat>
                    </Stats>
                </Stat>
                <Stat message="Darknode rewards">
                    <Stats>
                        <Stat message="All time total">$?</Stat>
                        <Stat message="24h total">$?</Stat>
                        <Stat highlight={true} message="Average monthly rewards / darknodes">$?</Stat>
                    </Stats>
                </Stat>
            </Stats>

            <DarknodeMap />
        </div>
    );
};
