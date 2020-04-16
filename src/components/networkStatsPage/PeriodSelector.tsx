import React from "react";

export enum Period {
    Hour = "H",
    Day = "D",
    Week = "W",
    Month = "M",
    Year = "Y",
    All = "A",
}

export const PeriodOption = ({ value, selected, onChange }: { value: Period, selected: Period, onChange: (value: Period) => void }) => {
    const onClick = React.useCallback(() => {
        onChange(value);
    }, [onChange, value]);
    return <div className={`period-option ${selected === value ? "period-option--selected" : ""}`} role="button" onClick={onClick}>{value}</div>;
};

export const PeriodSelector = ({ selected, onChange }: { selected: Period, onChange: (value: Period) => void }) => {
    return (
        <div className="period-selector">
            <PeriodOption value={Period.Hour} selected={selected} onChange={onChange} />
            <PeriodOption value={Period.Day} selected={selected} onChange={onChange} />
            <PeriodOption value={Period.Week} selected={selected} onChange={onChange} />
            <PeriodOption value={Period.Month} selected={selected} onChange={onChange} />
            <PeriodOption value={Period.Year} selected={selected} onChange={onChange} />
            <PeriodOption value={Period.All} selected={selected} onChange={onChange} />
        </div>
    );
};
