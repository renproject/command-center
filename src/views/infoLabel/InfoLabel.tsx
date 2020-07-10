import * as React from "react";

import { ReactComponent as Info } from "./info.svg";
import "./styles.scss";
import { ReactComponent as Warning } from "./warning.svg";

export enum LabelLevel {
    Info = "info",
    Warning = "warning"
}

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    level?: LabelLevel;
    children?: React.ReactNode;
    direction?: "bottom" | "top";
    align?: "left" | "center" | "right";
}

const HIDE_LABEL_TIMEOUT = 200; // ms

/**
 * InfoLabel is a visual component for displaying an information message for
 * another component
 */
export const InfoLabel = ({ level, children, direction, align, className, ...props }: Props) => {
    const timeout = React.useRef<NodeJS.Timeout | null>(null);
    const [fade, setFade] = React.useState(false);
    const [hover, setHover] = React.useState(false);
    const onMouseEnter = () => {
        if (timeout.current) clearTimeout(timeout.current);
        setFade(false);
        setHover(true);
    };
    const onMouseLeave = () => {
        setFade(true);
        timeout.current = setTimeout(() => setHover(false), HIDE_LABEL_TIMEOUT);
    };

    return <div {...props} className={[`info-label`, `info-label-${direction || "bottom"}`, `info-label-${align || "center"}`, hover ? `info-label--active` : "", fade ? `info-label--fading` : "", className].join(" ")} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {level === LabelLevel.Warning ? <Warning className="info-label--icon" /> : <Info className="info-label--icon" />}
        <div className="info-label--message">{children ? children : ""}</div>
    </div>;
};
