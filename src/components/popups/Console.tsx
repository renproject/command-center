import * as React from "react";

import { List } from "immutable";

// Used for CSS styling
const NUMERATOR = 164; // pixels
const DENOMINATOR = 94; // pixels
const OFFSET = 8994; // pixels

interface ConsoleProps {
    logs: List<JSX.Element>;
}

interface ConsoleState {
    level: number;
}

export class Console extends React.Component<ConsoleProps, ConsoleState> {
    private bottomElement: HTMLElement | null = null;
    constructor(props: ConsoleProps) {
        super(props);
        this.state = {
            level: OFFSET,
        };
    }

    public render(): JSX.Element {
        const { level } = this.state;
        const enhanced = level > (NUMERATOR + DENOMINATOR ** 2);
        return (
            <div className={`monospace console ${enhanced ? "enhanced" : ""}`} onClick={this.onClickHandler}>
                {this.props.logs}
                <div ref={(ref) => { this.bottomElement = ref; }} />
            </div>);
    }

    public componentDidMount() {
        this.scrollToBottom();
    }

    public componentWillReceiveProps() {
        this.scrollToBottom();
    }

    private scrollToBottom = () => {
        // Render any new logs before scrolling to bottom
        this.forceUpdate(() => {
            if (this.bottomElement) {
                this.bottomElement.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    private onClickHandler = (event: React.MouseEvent<HTMLElement>) => {
        const { level } = this.state;
        this.setState({
            level: level + 1,
        });
    }
}
