import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    onCancel?: (() => void) | (() => Promise<void>);
}

export const Popup: React.FC<Props> = ({
    onCancel,
    children,
    className,
    ...props
}) => {
    return (
        <div {...props} className={`popup ${className || ""}`}>
            {onCancel ? (
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
