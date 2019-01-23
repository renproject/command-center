import * as React from "react";

import { LabelLevel } from "../reducers/types";

/**
 * InfoLabel is a visual component for displaying an information message for
 * another component
 */
export class InfoLabel extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            top: 0,
            left: 0,
        };
    }

    /**
     * The main render function.
     * @dev Should have minimal computation, loops and anonymous functions.
     */
    public render(): React.ReactNode {
        const { level, children } = this.props;
        const iconType = level || LabelLevel.Info;
        return (
            <div className="label">
                <div className={`label--icon ${iconType}--icon`} onMouseEnter={this.onMouseEnter} />
                <div style={this.state} className="label--message">{children ? children : ""}</div>
            </div>
        );
    }

    private readonly onMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
        const { top, left, width, height } = event.currentTarget.getBoundingClientRect();
        this.setState({
            top: top - height / 2,
            left: left + width / 2,
        });
    }
}

interface Props {
    level?: LabelLevel;
    children?: React.ReactNode;
}

interface State {
    top: number;
    left: number;
}
