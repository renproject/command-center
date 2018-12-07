import * as React from "react";


interface HeaderProps {
}

interface HeaderState {
}

export default class Header extends React.Component<HeaderProps, HeaderState> {
    public render(): JSX.Element {
        return (
            <div className="header" />
        );
    }
}
