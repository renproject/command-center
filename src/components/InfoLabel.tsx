import * as React from "react";

import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { LabelType } from "../reducers/types";

interface Props {
    type?: LabelType;
    children?: React.ReactNode;
}

interface State {
    top: number;
    left: number;
}

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

    public render = (): JSX.Element => {
        const { type, children } = this.props;
        const iconType = type || LabelType.Info;
        return (
            <div className="label">
                <div className={`label--icon ${iconType}--icon`} onMouseEnter={this.onMouseEnter}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                </div>
                <div style={this.state} className="label--message">{children ? children : ""}</div>
            </div>
        );
    }

    private onMouseEnter = (event: React.MouseEvent<HTMLElement>): void => {
        const { top, left, width, height } = event.currentTarget.getBoundingClientRect();
        this.setState({
            top: top - height / 2,
            left: left + width / 2,
        });
    }
}
