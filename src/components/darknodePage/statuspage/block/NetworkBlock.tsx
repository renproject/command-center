import * as React from "react";

import { faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { DarknodesState } from "../../../../store/applicationState";
import { darknodeIDHexToBase58 } from "../../Darknode";
import { Block, BlockBody, BlockTitle } from "./Block";

export const NetworkBlock = (props: Props): JSX.Element => {
    const { darknodeDetails } = props;

    const darknodeIDBase58 = darknodeDetails ? darknodeIDHexToBase58(darknodeDetails.ID) : "";

    return (

        <Block className="network-block">
            {/* {showAdvanced ? <div className="block--basic--hide" onClick={this.toggleAdvanced}>
                <FontAwesomeIcon icon={faTimes} pull="left" />
            </div> : null} */}

            <BlockTitle>
                <h3>
                    <FontAwesomeIcon icon={faServer} pull="left" />
                    Network Information
                </h3>
            </BlockTitle>

            {darknodeDetails ? <BlockBody>
                <div className="network-block--info">
                    <table className="darknode-info">
                        <tbody>
                            <tr><td>ID</td><td>{darknodeIDBase58}</td></tr>
                            <tr><td>Address</td><td>{darknodeDetails.ID}</td></tr>
                            <tr><td>Public Key</td><td>{darknodeDetails.publicKey}</td></tr>
                            <tr><td>Operator</td><td>{darknodeDetails.operator}</td></tr>
                        </tbody>
                    </table>
                </div>
            </BlockBody> : null}
        </Block>
    );
};

// tslint:disable: react-unused-props-and-state
interface Props {
    darknodeDetails: DarknodesState | null;
}
