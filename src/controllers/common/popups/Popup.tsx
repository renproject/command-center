import React from "react";

import { ReactComponent as XIcon } from "../../../styles/images/icon-x.svg";

export const Popup: React.FC<Props> = ({
    onCancel,
    children,
    className,
    ...props
}) => {
    return (
        <div {...props} className={`popup ${className}`}>
            {onCancel ? (
                // <button className="titled--x--white" onClick={onCancel}>
                //     <XIcon />
                // </button>
                <div
                    role="button"
                    className="titled-block--close titled--x titled--x--white"
                    onClick={onCancel}
                />
            ) : (
                <></>
            )}
            {children}
        </div>
    );
};

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    onCancel?: (() => void) | (() => Promise<void>);
}
