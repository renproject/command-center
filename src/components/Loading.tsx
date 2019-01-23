import * as React from "react";

/**
 * Loading is a visual component that renders a spinning animation
 */
export const Loading = (props: Props): JSX.Element => {
    const { alt, className } = props;
    return (
        <div className={`loading lds-dual-ring ${alt ? "alt" : ""} ${className ? className : ""}`} />
    );
};

// tslint:disable: react-unused-props-and-state
interface Props {
    alt?: boolean;
    className?: string;
}
