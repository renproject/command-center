import React, { useCallback } from "react";

import { PeriodType } from "../../../lib/graphQL/volumes";

const PeriodOption = ({
    value,
    selected,
    onChange,
}: {
    value: PeriodType;
    selected: PeriodType;
    onChange: (value: PeriodType) => void;
}) => {
    const onClick = useCallback(() => {
        onChange(value);
    }, [onChange, value]);
    return (
        <div
            className={`period-option ${
                selected === value ? "period-option--selected" : ""
            }`}
            role="button"
            onClick={onClick}
        >
            {value.slice(0, 1).toUpperCase()}
        </div>
    );
};

export const PeriodSelector = ({
    selected,
    onChange,
}: {
    selected: PeriodType;
    onChange: (value: PeriodType) => void;
}) => {
    return (
        <div className="period-selector">
            <PeriodOption
                value={PeriodType.HOUR}
                selected={selected}
                onChange={onChange}
            />
            <PeriodOption
                value={PeriodType.DAY}
                selected={selected}
                onChange={onChange}
            />
            <PeriodOption
                value={PeriodType.WEEK}
                selected={selected}
                onChange={onChange}
            />
            <PeriodOption
                value={PeriodType.MONTH}
                selected={selected}
                onChange={onChange}
            />
            {/* <PeriodOption value={PeriodType.YEAR} selected={selected} onChange={onChange} /> */}
            <PeriodOption
                value={PeriodType.ALL}
                selected={selected}
                onChange={onChange}
            />
        </div>
    );
};
