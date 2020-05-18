import * as React from "react";

import { classNames } from "../../../lib/react/className";
import { PopupContainer } from "../../../store/popupStore";
import { _catch_ } from "../ErrorBoundary";

/**
 * PopupController is a visual component for displaying an arbitrary component in the
 * foreground with the rest of the page in the background
 */
export const PopupController: React.FunctionComponent = ({ children }) => {
    const { popup, overlay, onCancel, dismissible } = PopupContainer.useContainer();

    const onClickHandler = () => {
        if (dismissible) {
            onCancel();
        }
    };

    return (<>
        <div className={classNames("popup--container", popup && overlay ? "popup--blur" : "")}>
            {children}
        </div>
        {popup ? <div className="popup--outer">
            {_catch_(popup, { popup: true, onCancel })}
            {overlay ?
                <div role="none" className="overlay" onClick={onClickHandler} /> : null}
        </div> : null}
    </>
    );
};

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
}

export const PopupError: React.FC<Props> = ({ className, children, ...props }) =>
    <div {...props} className={classNames("popup--error", className)}><span className="popup--error-label">Error</span>{children}</div>;
