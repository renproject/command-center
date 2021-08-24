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
    Arbitrum = "Arbitrum",
}

const ChainDotColors = {
    [ChainOption.All]: "#888888",
    [ChainOption.Ethereum]: "#627EEA",
    [ChainOption.BinanceSmartChain]: "#F9B72D",
    [ChainOption.Fantom]: "#1969ff",
    [ChainOption.Polygon]: "#8247e5",
    [ChainOption.Avalanche]: "#e84142",
    [ChainOption.Solana]: "#00ffbd",
    [ChainOption.Arbitrum]: "#28A0F0",
};

export const ChainLineColors = {
    [ChainOption.All]: "#006FE8",
    [ChainOption.Ethereum]: "#627EEA",
    [ChainOption.BinanceSmartChain]: "#F9B72D",
    [ChainOption.Fantom]: "#1969ff",
    [ChainOption.Polygon]: "#8247e5",
    [ChainOption.Avalanche]: "#e84142",
    [ChainOption.Solana]: "#00ffbd",
    [ChainOption.Arbitrum]: "#28A0F0",
};

export const ChainLineColorsTransparent = {
    [ChainOption.All]: "#006FE8",

    // 66 opacity added:
    [ChainOption.Ethereum]: "#627EEA66",
    [ChainOption.BinanceSmartChain]: "#F9B72D66",
    [ChainOption.Fantom]: "#1969ff66",
    [ChainOption.Polygon]: "#8247e566",
    [ChainOption.Avalanche]: "#e8414266",
    [ChainOption.Solana]: "#00ffbd66",
    [ChainOption.Arbitrum]: "#28A0F066",
};

export const ChainLabel: Record<ChainOption, string> = {
    [ChainOption.All]: "All",
    [ChainOption.Ethereum]: "Ethereum",
    [ChainOption.BinanceSmartChain]: "BSC",
    [ChainOption.Fantom]: "Fantom",
    [ChainOption.Polygon]: "Polygon",
    [ChainOption.Avalanche]: "Avalanche",
    [ChainOption.Solana]: "Solana",
    [ChainOption.Arbitrum]: "Arbitrum",
};

export const ChainIconName: Record<ChainOption, string> = {
    [ChainOption.All]: "All",
    [ChainOption.Ethereum]: "EthChain",
    [ChainOption.BinanceSmartChain]: "BSCChain",
    [ChainOption.Fantom]: "FantomChain",
    [ChainOption.Polygon]: "PolygonChain",
    [ChainOption.Avalanche]: "AvalancheChain",
    [ChainOption.Solana]: "SolanaChain",
    [ChainOption.Arbitrum]: "Arbitrum",
};

export const availableChains: Array<ChainOption> = [
    ChainOption.All,
    ChainOption.Ethereum,
    ChainOption.BinanceSmartChain,
    ChainOption.Fantom,
    ChainOption.Polygon,
    ChainOption.Avalanche,
    ChainOption.Solana,
    // ChainOption.Arbitrum,
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

    margin: 0px 5px 5px;

    &.selected {
        color: #001b3a;
        background: white;
    }
`;

const ChainSelelectorWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin: 0 -5px;
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
            <span style={{ marginTop: 1 }}>{ChainLabel[value]}</span>
        </ChainOptionDiv>
    );
};

export const ChainSelector = ({
    value,
    onChange,
}: {
    value: ChainOption;
    onChange: (value: ChainOption) => void;
}) => {
    return (
        <ChainSelelectorWrapper>
            {availableChains.map((chain) => (
                <ChainButton
                    key={chain}
                    value={chain}
                    onChange={onChange}
                    selected={chain === value}
                />
            ))}
        </ChainSelelectorWrapper>
    );
};
