import * as React from "react";

/**
 * Sidebar displays stats about an operator's darknodes collectively,
 * as well as a breakdown of each darknode
 */
export const EmptySidebarIcon = () => {

    return <div className="sidebar--row">
        <div className="sidebar--icon">
            <div className="sidebar--icon--empty" />
        </div>
    </div>;
};
