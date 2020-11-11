import React from "react";

interface Props {
    top: React.ReactNode;
    onClose?: () => void;
}

export const TitledSection: React.FC<Props> = ({ top, onClose, children }) => (
    <div className="titled-block">
        {onClose ? (
            <div
                role="button"
                className="titled-block--close popup--x popup--x--white"
                onClick={onClose}
            />
        ) : null}

        <div className="titled-block--top">{top}</div>

        <div className="titled-block--bottom">{children}</div>
    </div>
);
