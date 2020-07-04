import React from "react";

interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
}

export const URLs = {
    renProject: "https://renproject.io",
    renProjectDevelopers: "https://renproject.io/developers",
    feedbackButton: "https://renprotocol.typeform.com/to/YdmFyB",
    ccGithub: "https://github.com/renproject/command-center",
    gitbook: "https://docs.renproject.io/ren",
    gitbookDevelopers: "https://docs.renproject.io/developers",
    gitbookDarknodes: "https://docs.renproject.io/darknodes/",

    welcomeToCommandCenter: "https://medium.com/renproject/renvm-mainnet-release-98cac4c6fa8e",
    wiki: "https://github.com/renproject/ren/wiki",
};


export const ExternalLink: React.FC<Props> = ({ children, ...props }) => (
    // tslint:disable-next-line: react-a11y-anchors
    <a
        {...props}
        target="_blank"
        rel="noopener noreferrer"
    >
        {children}
    </a>
);
