import React, { useCallback } from "react";

import { PeriodOption } from "../../../lib/graphQL/volumes";

const availablePeriods: Array<PeriodOption> = [
    PeriodOption.HOUR,
    PeriodOption.DAY,
    PeriodOption.WEEK,
    PeriodOption.MONTH,
    PeriodOption.ALL,
];

const PeriodButton = ({
    value,
    selected,
    onChange,
}: {
    value: PeriodOption;
    selected: boolean;
    onChange: (value: PeriodOption) => void;
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
    value: PeriodOption;
    onChange: (value: PeriodOption) => void;
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
