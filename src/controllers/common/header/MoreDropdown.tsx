import React, { useRef, useState } from "react";

import { classNames } from "../../../lib/react/className";
import { ReactComponent as IconDropdown } from "../../../styles/images/icon-dropdown.svg";
import { ExternalLink, URLs } from "../../../views/ExternalLink";

const Option: React.FC<{ href: string }> = ({ href, children }) => (
    <ExternalLink href={href}>
        <li role="button" className="header--dropdown--option">
            {children}
        </li>
    </ExternalLink>
);

export const MoreDropdown: React.FC<{}> = () => {
    const [shown, setShown] = useState(false);

    const ref = useRef(null as HTMLDivElement | null);

    const clickAway = (event: MouseEvent) => {
        if (ref) {
            const current = ref.current;
            if (current && !current.contains(event.target as Node)) {
                setShown(false);
            }
        }
        document.removeEventListener("mousedown", clickAway);
    };

    const toggle = () => {
        const newShown = !shown;
        setShown(newShown);

        if (newShown) {
            document.addEventListener("mousedown", clickAway);
        } else {
            document.removeEventListener("mousedown", clickAway);
        }
    };

    return (
        <div className="header--group" ref={ref}>
            <div
                className={classNames("header--selected")}
                role="menuitem"
                onClick={toggle}
            >
                <span>More</span> <IconDropdown />
            </div>
            {shown ? (
                <div className="header--dropdown--spacing header--dropdown--options">
                    <ul className="header--dropdown">
                        <Option href={URLs.renProjectDevelopers}>
                            RenVM Developer Center
                        </Option>
                        <Option href={URLs.renProject}>RenProject.io</Option>
                        <Option href={URLs.wiki}>RenVM Wiki</Option>
                        <Option href={URLs.gitbookDevelopers}>
                            Developer Docs
                        </Option>
                    </ul>
                </div>
            ) : null}
        </div>
    );
};
