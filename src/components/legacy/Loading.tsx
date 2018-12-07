import * as React from "react";

interface LoadingProps {
    fixed?: boolean;
}

interface LoadingState {
}

class Loading extends React.Component<LoadingProps, LoadingState> {
    public render(): JSX.Element {
        return (
            <div className={`loading ${this.props.fixed ? "fixed" : ""} lds-dual-ring`} />
        );
    }
}

export default Loading;
