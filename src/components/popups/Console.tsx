import * as React from "react";

import { List } from "immutable";

// Used for CSS styling
const NUMERATOR = 164; // pixels
const DENOMINATOR = 94; // pixels
const OFFSET = 8994; // pixels

interface Props {
    logs: List<JSX.Element>;
}

interface State {
    level: number;
}

export class Console extends React.Component<Props, State> {
    private bottomElement: HTMLElement | null = null;
    constructor(props: Props) {
        super(props);
        this.state = {
            level: OFFSET,
        };
    }

    public render = (): JSX.Element => {
        const { level } = this.state;
        const enhanced = level > (NUMERATOR + DENOMINATOR ** 2);
        return (
            <div className={`monospace console ${enhanced ? "enhanced" : ""}`} onClick={this.onClickHandler}>
                {this.props.logs}
                <div ref={(ref: HTMLDivElement | null) => { this.bottomElement = ref; }} />
            </div>);
    }

    public componentDidMount = (): void => {
        this.scrollToBottom();
    }

    public componentWillReceiveProps = (): void => {
        this.scrollToBottom();
    }

    private scrollToBottom = (): void => {
        // Render any new logs before scrolling to bottom
        this.forceUpdate(() => {
            if (this.bottomElement) {
                this.bottomElement.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    private onClickHandler = (event: React.MouseEvent<HTMLElement>): void => {
        const { level } = this.state;
        this.setState({
            level: level + 1,
        });
    }
}
