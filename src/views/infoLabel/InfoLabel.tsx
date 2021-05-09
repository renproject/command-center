import React, { useRef, useState } from "react";

import { classNames } from "../../lib/react/className";
import { ReactComponent as Info } from "./info.svg";
import "./styles.scss";

interface Props
    extends React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    > {
    children?: React.ReactNode;
    direction?: "bottom" | "top";
    align?: "left" | "center" | "right";
}

const HIDE_LABEL_TIMEOUT = 200; // ms

/**
 * InfoLabel is a visual component for displaying an information message for
 * another component
 */
export const InfoLabel = ({
    children,
    direction,
    align,
    className,
    defaultValue,
    ...props
}: Props) => {
    const timeout = useRef<NodeJS.Timeout | null>(null);
    const [fade, setFade] = useState(false);
    const [hover, setHover] = useState(false);
    const onMouseEnter = () => {
        if (timeout.current) clearTimeout(timeout.current);
        setFade(false);
        setHover(true);
    };
    const onMouseLeave = () => {
        setFade(true);
        timeout.current = setTimeout(() => setHover(false), HIDE_LABEL_TIMEOUT);
    };

    return (
        <div
            defaultValue={defaultValue as string[]}
            {...props}
            className={classNames(
                `info-label`,
                `info-label-${direction || "bottom"}`,
                `info-label-${align || "center"}`,
                hover ? `info-label--active` : "",
                fade ? `info-label--fading` : "",
                className,
            )}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <Info className="info-label--icon" />
            <div className="info-label--message">
                {children ? children : ""}
            </div>
        </div>
    );
};
