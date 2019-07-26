import { useState } from "react";
import { MarkerType } from "react-simple-maps";
import { createContainer } from "unstated-next";

interface City extends MarkerType {
    darknodeID: string;
}

const sampleDarknodes: City[] = [
    { darknodeID: "8MJpA1rXYMPTeJoYjsFBHJcuYBe7zQ", coordinates: [2.1234, 48.1234] }
];

const useMapContainer = (initialState = 0) => {
    const [count, setCount] = useState(initialState);
    const [darknodes, setDarknodes] = useState(sampleDarknodes);
    const decrement = () => { setCount(count - 1); };
    const increment = () => { setCount(count + 1); };
    return { count, decrement, increment, darknodes };
};

export const MapContainer = createContainer(useMapContainer);
