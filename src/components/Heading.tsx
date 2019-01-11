import * as React from "react";

interface Props {
    title: JSX.Element | string;
    description?: JSX.Element | string;
}

/**
 * Heading is a visual component for displaying a title above another component
 */
export const Heading = (props: Props): JSX.Element => {
    const { title, description } = props;
    return (
        <div className="heading">
            <h1 className="heading--title">{title}</h1>
            {description &&
                <h2 className="heading--description">({description})</h2>
            }
        </div>
    );
};
