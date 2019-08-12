import React from "react";
import { Link } from "react-router-dom";
import {
    ComposableMap, Geographies, Geography, Marker, Markers, ZoomableGroup,
} from "react-simple-maps";

import { MapContainer } from "../mapContainer";
import MapJSON from "./world-50m.json";

export const DarknodeMap = () => {
    const container = MapContainer.useContainer();

    React.useEffect(() => {
        const fetchIPs = () => {
            container.fetchDarknodes().catch(console.error);
        };

        // Every two minutes
        const interval = setInterval(fetchIPs, 120 * 1000);
        if (container.darknodes.length === 0) {
            fetchIPs();
        }

        return () => {
            clearInterval(interval);
        };
        // tslint:disable-next-line:react-hooks/exhaustive-dep
    }, []);

    return <div className="map">
        <ComposableMap
            className="map--world"
            projectionConfig={{ scale: 205 }}
            width={980}
            height={551}
            style={{
                width: "100%",
                height: "auto",
            }}
        >
            <ZoomableGroup center={[0, 20]} disablePanning>
                <Geographies geography={MapJSON}>
                    {(geographies, projection) =>
                        geographies.map((geography, i) =>
                            // Don't render Antarctica
                            (geography as { id: string }).id !== "ATA" && (
                                <Geography
                                    key={i}
                                    geography={geography}
                                    projection={projection}
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
                            ))}
                </Geographies>
                <Markers>
                    {container.darknodes.map((darknode, i) => <Marker key={i} marker={darknode}>
                        <Link to={`/darknode/${darknode.darknodeID}`}>
                            <circle
                                cx={0}
                                cy={0}
                                r={5}
                            />
                        </Link>
                    </Marker>)}
                </Markers>
            </ZoomableGroup>
        </ComposableMap>
    </div>;
};
