import * as React from "react";

interface LoadingProps {
    alt?: boolean;
    className?: string;
}

interface LoadingState {
}

/**
 * Loading is a visual component that renders a spinning animation
 */
export class Loading extends React.Component<LoadingProps, LoadingState> {
    public render(): JSX.Element {
        const { alt, className } = this.props;
        return (
            <div className={`loading lds-dual-ring ${alt ? "alt" : ""} ${className ? className : ""}`} />
        );
    }
}
