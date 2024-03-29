import React, { useCallback } from "react";

import { PeriodOption } from "../../../lib/graphQL/volumes";

export enum StatTab {
    History = "History",
    DigitalAssets = "Digital Assets",
}

const Tab: React.FC<{
    value: StatTab;
    selected: string;
    onChange: (value: StatTab) => void;
}> = ({ value, selected, onChange, children }) => {
    const onClick = useCallback(() => {
        onChange(value);
    }, [onChange, value]);
    return (
        <div
            className={`stat-tab-option ${
                selected === value ? "stat-tab-option--selected" : ""
            }`}
            role="button"
            onClick={onClick}
        >
            {children || value}
        </div>
    );
};

export const StatTabs = ({
    selected,
    onChange,
    volumePeriod,
    assetsPeriod,
}: {
    selected: string;
    onChange: (value: StatTab) => void;
    volumePeriod: PeriodOption;
    assetsPeriod: PeriodOption | null;
}) => {
    return (
        <div className="stat-tabs">
            <Tab
                value={StatTab.History}
                selected={selected}
                onChange={onChange}
            >
                History (
                {volumePeriod === PeriodOption.ALL ? (
                    "ALL"
                ) : (
                    <>1{volumePeriod.slice(0, 1).toUpperCase()}</>
                )}
                )
            </Tab>
            <Tab
                value={StatTab.DigitalAssets}
                selected={selected}
                onChange={onChange}
            >
                Digital Assets{" "}
                {assetsPeriod ? (
                    <>
                        (
                        {assetsPeriod === PeriodOption.ALL ? (
                            "ALL"
                        ) : (
                            <>1{assetsPeriod.slice(0, 1).toUpperCase()}</>
                        )}
                        )
                    </>
                ) : null}
            </Tab>
        </div>
    );
};
