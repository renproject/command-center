import React from "react";

import { PeriodType } from "../../lib/graphQL/volumes";

export enum StatTab {
    History = "History",
    DigitalAssets = "Digital Assets",
}

export const Tab: React.FunctionComponent<{ value: StatTab, selected: string, onChange: (value: StatTab) => void }> = ({ value, selected, onChange, children }) => {
    const onClick = React.useCallback(() => {
        onChange(value);
    }, [onChange, value]);
    return <div className={`stat-tab-option ${selected === value ? "stat-tab-option--selected" : ""}`} role="button" onClick={onClick}>{children || value}</div>;
};

export const StatTabs = ({ selected, onChange, volumePeriod, assetsPeriod }: { selected: string, onChange: (value: StatTab) => void, volumePeriod: PeriodType, assetsPeriod: PeriodType | null }) => {
    return (
        <div className="stat-tabs">
            <Tab value={StatTab.History} selected={selected} onChange={onChange}>History ({volumePeriod === PeriodType.ALL ? "ALL" : <>1{volumePeriod.slice(0, 1).toUpperCase()}</>})</Tab>
            <Tab value={StatTab.DigitalAssets} selected={selected} onChange={onChange}>Digital Assets {assetsPeriod ? <>({assetsPeriod === PeriodType.ALL ? "ALL" : <>1{assetsPeriod.slice(0, 1).toUpperCase()}</>})</> : <></>}</Tab>
        </div>
    );
};
