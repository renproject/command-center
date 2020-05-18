import * as React from "react";

import { EmptyDarknodeCard } from "./EmptyDarknodeCard";

type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const EmptyDarknodeList: React.StatelessComponent<Props> = (props) =>
    <div {...props} className={[props.className, "background--darknode-list--outer"].join(" ")}>
        <div className="darknode-list background--darknode-list">
            <EmptyDarknodeCard />
            <EmptyDarknodeCard />
            <EmptyDarknodeCard />
            {/* <EmptyDarknodeCard /> */}
        </div>
        {props.children}
    </div>;
