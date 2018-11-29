import * as React from "react";

import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";

import { ApplicationData } from "@Reducers/types";

interface StoreProps {
}

interface FooterProps extends StoreProps {
    actions: {
    };
}

interface FooterState {
}

/**
 * Footer is a visual component providing page branding and navigation.
 */
class Footer extends React.Component<FooterProps, FooterState> {
    public constructor(props: FooterProps, context: object) {
        super(props, context);
        this.state = {};
    }

    public render(): JSX.Element {
        return (
            <div className="footer">
                <div className="container">
                    <span>Copyright © 2018 Republic Protocol. <Link to="#">Privacy Statement</Link></span>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: ApplicationData): StoreProps {
    return {
    };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: FooterProps["actions"] } {
    return {
        actions: bindActionCreators({
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Footer);
