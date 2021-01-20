import { Map } from "immutable";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
} from "react-simple-maps";
import ReactTooltip from "react-tooltip";

import { DarknodeLocation } from "../../store/mapContainer";
import MapJSON from "./world-50m.json";

interface Props {
    darknodes: Map<string, DarknodeLocation>;
}

export const DarknodeMap: React.FC<Props> = ({ darknodes }) => {
    const [tooltipContent, setTooltipContent] = useState("");

    return (
        <div className="map">
            <ComposableMap
                data-tip=""
                className="map--world"
                projection="geoEqualEarth"
                projectionConfig={{ scale: 215, center: [0, 5] }}
                width={980}
                height={551}
                style={{
                    width: "100%",
                    height: "auto",
                }}
            >
                <Geographies geography={MapJSON}>
                    {({ geographies }) =>
                        geographies.map((geography, i) => {
                            // Don't render Antarctica
                            return (
                                geography.properties.NAME !== "Antarctica" && (
                                    <Geography
                                        key={i}
                                        geography={geography}
                                        style={{
                                            default: {
                                                fill: "#00244d",
                                                stroke: "#00244d",
                                                strokeWidth: 0,
                                                outline: "none",
                                            },
                                            hover: {
                                                fill: "#00244d",
                                                stroke: "#00244d",
                                                strokeWidth: 0,
                                                outline: "none",
                                            },
                                            pressed: {
                                                fill: "#00244d",
                                                stroke: "#00244d",
                                                strokeWidth: 0,
                                                outline: "none",
                                            },
                                        }}
                                    />
                                )
                            );
                        })
                    }
                </Geographies>
                {darknodes.map((darknode) => {
                    const onMouseEnter = () => {
                        setTooltipContent(`${darknode.darknodeID}`);
                    };
                    const onMouseLeave = () => {
                        setTooltipContent("");
                    };
                    return (
                        <Marker
                            key={darknode.darknodeID}
                            coordinates={darknode.point}
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
                        >
                            <Link to={`/darknode/${darknode.darknodeID}`}>
                                <circle cx={0} cy={0} r={4} />
                            </Link>
                        </Marker>
                    );
                })}
            </ComposableMap>
            <ReactTooltip>{tooltipContent}</ReactTooltip>
        </div>
    );
};
