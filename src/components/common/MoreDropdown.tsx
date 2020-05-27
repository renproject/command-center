import * as React from "react";

import { classNames } from "../../lib/react/className";
import { ReactComponent as IconDropdown } from "../../styles/images/icon-dropdown.svg";
import { ExternalLink, URLs } from "./ExternalLink";

const Option: React.FC<{ href: string }> = ({ href, children }) =>
    <ExternalLink href={href}><li role="button" className="header--dropdown--option">
        {children}
    </li></ExternalLink>;

// tslint:disable: react-unused-props-and-state
export const MoreDropdown: React.StatelessComponent<Props> = ({ }) => {
    const [shown, setShown] = React.useState(false);

    const ref = React.useRef(null as HTMLDivElement | null);

    // tslint:disable-next-line: no-any
    const clickAway = (event: any) => {
        // tslint:disable-next-line: no-any
        if (ref) {
            const current = ref.current;
            if ((current && !current.contains(event.target))) {
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

    return <div
        className="header--group"
        ref={ref}
    >
        <div className={classNames("header--selected")} role="menuitem" onClick={toggle}><span>More</span> <IconDropdown /></div>
        {shown ?
            <div className="header--dropdown--spacing header--dropdown--options">
                <ul className="header--dropdown">
                    <Option href={URLs.renProjectDevelopers}>RenVM Developer Center</Option>
                    <Option href={URLs.renProject}>RenProject.io</Option>
                    <Option href={URLs.wiki}>RenVM Wiki</Option>
                    <Option href={URLs.gitbookDevelopers}>Developer Docs</Option>
                </ul>
            </div> : <></>
        }
    </div>;
};

interface Props {
}
