import * as React from "react";

import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ReactComponent as Help } from "../../styles/images/help.svg";
import { ExternalLink } from "./ExternalLink";

export const Footer = () => {
    return <div className="footer">
        <div className="footer--left">
            <div>Ren Command Center v2.01</div>
        </div>
        <div className="footer--right">
            <div><ExternalLink href="https://github.com/renproject/command-center"><FontAwesomeIcon icon={faGithub} /><span>Github</span></ExternalLink></div>
            <div><ExternalLink href="https://docs.renproject.io/ren/"><Help /><span>Help</span></ExternalLink></div>
        </div>
    </div>;
};
