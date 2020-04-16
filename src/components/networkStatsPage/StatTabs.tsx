import React from "react";

import { Period } from "./PeriodSelector";

export const Tab: React.FunctionComponent<{ value: string, selected: string, onChange: (value: string) => void }> = ({ value, selected, onChange, children }) => {
    const onClick = React.useCallback(() => {
        onChange(value);
    }, [onChange, value]);
    return <div className={`stat-tab-option ${selected === value ? "stat-tab-option--selected" : ""}`} role="button" onClick={onClick}>{children || value}</div>;
};

export const StatTabs = ({ selected, onChange, volumePeriod, assetsPeriod }: { selected: string, onChange: (value: string) => void, volumePeriod: Period, assetsPeriod: Period | null }) => {
    return (
        <div className="stat-tabs">
            <Tab value="Volume" selected={selected} onChange={onChange}>Volume (1{volumePeriod})</Tab>
            <Tab value="Digital Assets" selected={selected} onChange={onChange}>Digital Assets {assetsPeriod ? <>(1{assetsPeriod})</> : <></>}</Tab>
        </div>
    );
};
