import React from "react";

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    selected: string;
    tabs: {
        [tab: string]: React.ReactNode;
    };
    onTab?: (tab: string) => void;
}

export const Tabs: React.FC<Props> = ({ tabs, selected, onTab, className, children, ...props }) => (
    <div {...props} className={[className, "tabs--outer"].join(" ")}>
        <div className="tabs">
            {Object.keys(tabs).map((tab) => {
                const onClick = () => {
                    if (onTab) {
                        onTab(tab);
                    }
                };
                return <input key={tab} className={`tab ${tab === selected ? "selected" : ""}`} type="button" value={tab} onClick={onClick} />;
            })}
        </div>
        {tabs[selected]}
        {children}
    </div>
);
