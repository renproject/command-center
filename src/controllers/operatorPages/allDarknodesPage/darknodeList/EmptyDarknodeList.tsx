import React from "react";

import { classNames } from "../../../../lib/react/className";
import { EmptyDarknodeCard } from "./EmptyDarknodeCard";

type Props = React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
>;

export const EmptyDarknodeList: React.FC<Props> = ({
    defaultValue,
    ...props
}) => (
    <div
        defaultValue={defaultValue as string[]}
        {...props}
        className={classNames(
            props.className,
            "background--darknode-list--outer",
        )}
    >
        <div className="darknode-list background--darknode-list">
            <EmptyDarknodeCard />
            <EmptyDarknodeCard />
            <EmptyDarknodeCard />
            {/* <EmptyDarknodeCard /> */}
        </div>
        {props.children}
    </div>
);
