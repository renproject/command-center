import * as React from "react";

import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ReactComponent as Help } from "../../styles/images/help.svg";

export const Footer = () => {
    return <div className="footer">
        <div className="footer--left">
            <div>Ren Command Center v2.01</div>
        </div>
        <div className="footer--right">
            <div><a target="_blank" rel="noopener noreferrer" href="https://github.com/renproject/command-center"><FontAwesomeIcon icon={faGithub} /><span>Github</span></a></div>
            {/* <div><a href="/"><span>Privacy</span></a></div> */}
            <div><a target="_blank" rel="noopener noreferrer" href="https://docs.renproject.io/ren/"><Help /><span>Help</span></a></div>
        </div>
    </div>;
};
