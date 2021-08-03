import React, { useCallback } from "react";
import styled from "styled-components";

export enum ChainOption {
    All = "All",
    Ethereum = "Ethereum",
    BinanceSmartChain = "BinanceSmartChain",
    Fantom = "Fantom",
    Polygon = "Polygon",
    Avalanche = "Avalanche",
    Solana = "Solana",
}

const ChainDotColors = {
    [ChainOption.All]: "#000000",
    [ChainOption.Ethereum]: "#627EEA",
    [ChainOption.BinanceSmartChain]: "#F9B72D",
    [ChainOption.Fantom]: "#1969ff",
    [ChainOption.Polygon]: "#8247e5",
    [ChainOption.Avalanche]: "#e84142",
    [ChainOption.Solana]: "#00ffbd",
};

export const ChainLabel: Record<ChainOption, string> = {
    [ChainOption.All]: "All Chains",
    [ChainOption.Ethereum]: "Ethereum",
    [ChainOption.BinanceSmartChain]: "BSC",
    [ChainOption.Fantom]: "Fantom",
    [ChainOption.Polygon]: "Polygon",
    [ChainOption.Avalanche]: "Avalanche",
    [ChainOption.Solana]: "Solana",
};

const availableChains: Array<ChainOption> = [
    ChainOption.All,
    ChainOption.Ethereum,
    ChainOption.BinanceSmartChain,
    ChainOption.Fantom,
    ChainOption.Polygon,
    ChainOption.Avalanche,
    ChainOption.Solana,
];

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

const ChainButton = ({
    value,
    selected,
    onChange,
}: {
    value: ChainOption;
    selected: boolean;
    onChange: (value: ChainOption) => void;
}) => {
    const onClick = useCallback(() => {
        onChange(value);
    }, [onChange, value]);
    return (
        <ChainOptionDiv
            className={selected ? "selected" : ""}
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
    value,
    onChange,
}: {
    value: ChainOption;
    onChange: (value: ChainOption) => void;
}) => {
    return (
        <ChainSelectorDiv>
            {availableChains.map((chain) => (
                <ChainButton
                    key={chain}
                    value={chain}
                    onChange={onChange}
                    selected={chain === value}
                />
            ))}
        </ChainSelectorDiv>
    );
};
