import React, { useCallback } from "react";

import { PeriodType } from "../../../lib/graphQL/volumes";

const availablePeriods: Array<PeriodType> = [
    PeriodType.HOUR,
    PeriodType.DAY,
    PeriodType.WEEK,
    PeriodType.MONTH,
    PeriodType.ALL,
];

const PeriodButton = ({
    value,
    selected,
    onChange,
}: {
    value: PeriodType;
    selected: boolean;
    onChange: (value: PeriodType) => void;
}) => {
    const onClick = useCallback(() => {
        onChange(value);
    }, [onChange, value]);
    return (
        <div
            className={`period-option ${
                selected ? "period-option--selected" : ""
            }`}
            role="button"
            onClick={onClick}
        >
            {value.slice(0, 1).toUpperCase()}
        </div>
    );
};

export const PeriodSelector = ({
    value,
    onChange,
}: {
    value: PeriodType;
    onChange: (value: PeriodType) => void;
}) => {
    return (
        <div className="period-selector">
            {availablePeriods.map((period) => (
                <PeriodButton
                    key={period}
                    value={period}
                    selected={value === period}
                    onChange={onChange}
                />
            ))}
        </div>
    );
};
