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
                className="titled-block--close titled--x titled--x--white"
                onClick={onClose}
            />
        ) : null}

        <div className="titled-block--top">{top}</div>

        {children ? (
            <div className="titled-block--bottom">{children}</div>
        ) : (
            <></>
        )}
    </div>
);

interface TokenSectionProps {
    icon: React.ReactNode;
}

export const TokenSection: React.FC<TokenSectionProps> = ({
    icon,
    children,
}) => (
    <div className="token-block">
        <div className="token-block--icon">{icon}</div>
        <div className="token-block--body">{children}</div>
    </div>
);
