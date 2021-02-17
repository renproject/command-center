import React, { useCallback } from "react";
import styled from "styled-components";

import { NetworkStatsChain } from "./networkStatsContainer";

const ChainDotColors = {
    // [NetworkStatsChain.All]: "#006FE8",
    [NetworkStatsChain.Ethereum]: "#627EEA",
    [NetworkStatsChain.BinanceSmartChain]: "#F9B72D",
};

const ChainDotDiv = styled.div`
    background: rgb(255, 187, 0);
    display: block;
    border-radius: 100%;
    width: 8px;
    height: 8px;
    margin-right: 4px;
`;

const ChainOptionDiv = styled.div`
    cursor: pointer;

    border: 1px solid #ffffff;
    border-radius: 100px;
    font-size: 13px;
    line-height: 13px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 10px;

    & + div {
        margin-left: 10px;
    }

    &.selected {
        color: #001b3a;
        background: white;
    }
`;

const ChainOption = ({
    value,
    selected,
    onChange,
}: {
    value: NetworkStatsChain;
    selected: NetworkStatsChain;
    onChange: (value: NetworkStatsChain) => void;
}) => {
    const onClick = useCallback(() => {
        onChange(value);
    }, [onChange, value]);
    return (
        <ChainOptionDiv
            className={selected === value ? "selected" : ""}
            role="button"
            onClick={onClick}
        >
            <ChainDotDiv style={{ background: ChainDotColors[value] }} />
            <span style={{ marginTop: 1 }}>{value}</span>
        </ChainOptionDiv>
    );
};

const ChainSelectorDiv = styled.div`
    display: flex;
`;

export const ChainSelector = ({
    selected,
    onChange,
}: {
    selected: NetworkStatsChain;
    onChange: (value: NetworkStatsChain) => void;
}) => {
    return (
        <ChainSelectorDiv>
            <ChainOption
                value={NetworkStatsChain.Ethereum}
                selected={selected}
                onChange={onChange}
            />
            {/* <ChainOption
                value={NetworkStatsChain.BinanceSmartChain}
                selected={selected}
                onChange={onChange}
            /> */}
        </ChainSelectorDiv>
    );
};
