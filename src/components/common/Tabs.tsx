import React, { useState } from "react";

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    tabs: {
        [tab: string]: React.ReactNode;
    };
    defaultTab?: string;
    onTab?: (tab: string) => void;
}

export const Tabs: React.FC<Props> = ({ tabs, defaultTab, onTab, className, children, ...props }) => {
    const [selectedTab, setSelectedTab] = useState<keyof Props["tabs"]>(defaultTab || Object.keys(tabs)[0]);

    return <div {...props} className={[className, "tabs--outer"].join(" ")}>
        <div className="tabs">
            {Object.keys(tabs).map((tab) => {
                const onClick = () => {
                    setSelectedTab(tab);
                    if (onTab) {
                        onTab(tab);
                    }
                };
                return <input key={tab} className={`tab ${tab === selectedTab ? "selected" : ""}`} type="button" value={tab} onClick={onClick} />;
            })}
        </div>
        {tabs[selectedTab]}
        {children}
    </div>;
};
