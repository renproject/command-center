import * as React from "react";

import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { RouteComponentProps, withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";

import { ApplicationState } from "../../store/applicationState";
import { AppDispatch } from "../../store/rootReducer";
import { hideMobileMenu } from "../../store/ui/uiActions";
import { ReactComponent as Help } from "../../styles/images/help.svg";

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        address: state.account.address,
        darknodeList: state.account.address ? state.network.darknodeList.get(state.account.address, null) : null,
        darknodeDetails: state.network.darknodeDetails,
        darknodeNames: state.network.darknodeNames,
        quoteCurrency: state.network.quoteCurrency,
        mobileMenuActive: state.ui.mobileMenuActive,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        hideMobileMenu,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps>, RouteComponentProps {
}

export const Footer = connect(mapStateToProps, mapDispatchToProps)(withRouter(
    ({ }: Props) => {

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
    }
));
