import * as React from "react";

interface HeadingProps {
    title: JSX.Element | string;
    description?: JSX.Element | string;
}

interface HeadingState {
}

/**
 * Heading is a visual component for displaying a title above another component
 */
class Heading extends React.Component<HeadingProps, HeadingState> {
    public render(): JSX.Element {
        const { title, description } = this.props;
        return (
            <div className="heading">
                <h1 className="heading--title">{title}</h1>
                {description &&
                    <h2 className="heading--description">({description})</h2>
                }
            </div>
        );
    }
}

export default Heading;
