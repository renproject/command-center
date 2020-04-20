import * as React from "react";

import { Blocky, InfoLabel } from "@renproject/react-components";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { NULL, RegistrationStatus } from "../../../lib/ethereum/contractReads";
import { DarknodesState } from "../../../store/applicationState";
import { setDarknodeName } from "../../../store/network/operatorActions";
import { AppDispatch } from "../../../store/rootReducer";
import { Web3Container } from "../../../store/web3Store";
import { DarknodeID } from "../../common/DarknodeID";
import { DarknodeAction } from "../Darknode";
import { EpochBlock } from "./block/EpochBlock";
import { FeesBlock } from "./block/FeesBlock";
import { GasBlock } from "./block/GasBlock";
import { NetworkBlock } from "./block/NetworkBlock";
import { ResourcesBlock } from "./block/ResourcesBlock";
import { VersionBlock } from "./block/VersionBlock";
import { Notifications } from "./Notifications";
import { Registration } from "./Registration";

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        setDarknodeName,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    action: DarknodeAction;
    isOperator: boolean;

    darknodeID: string;
    darknodeDetails: DarknodesState | null;
    name: string | undefined;
    publicKey: string | undefined;
}

const StatusPageClass: React.StatelessComponent<Props> = ({ darknodeDetails, darknodeID, name, isOperator, action, publicKey, actions }) => {
    const { renNetwork } = Web3Container.useContainer();

    const [renaming, setRenaming] = React.useState(false);
    const [newName, setNewName] = React.useState<string | undefined>(name);

    const focusInputRef = React.useRef<HTMLInputElement | null>(null);

    const handleInput = (event: React.FormEvent<HTMLInputElement>): void => {
        const element = (event.target as HTMLInputElement);
        setNewName(element.value);
    };

    const handleRename = (): void => {
        // Use setState callback to set focus to input (otherwise, input will
        // not have been rendered yet)
        setRenaming(true);
        if (focusInputRef) {
            const current = focusInputRef.current;
            if (current) {
                current.focus();
            }
        }
    };

    const handleCancelRename = () => {
        setRenaming(false);
    };

    const handleSubmitName = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!newName) {
            return;
        }

        setRenaming(false);
        actions.setDarknodeName({ darknodeID, name: newName });
    };

    React.useEffect(() => {
        if (newName === undefined && name !== undefined) {
            setNewName(name);
        }
    }, [name]);

    let noDarknode;
    if (
        darknodeDetails &&
        action !== DarknodeAction.Register &&
        darknodeDetails.registrationStatus === RegistrationStatus.Unregistered &&
        darknodeDetails.operator === NULL
    ) {
        noDarknode = true;
    }

    const focusedClass = action !== DarknodeAction.View ? "statuspage--focused" : "";
    const renamingCLass = renaming ? "statuspage--renaming" : "";
    const noDarknodeClass = noDarknode || !darknodeDetails ? "statuspage--no-darknode" : "";

    const notifications = <Notifications isOperator={isOperator} darknodeDetails={darknodeDetails} renNetwork={renNetwork} />;

    return (
        <div className={`container statuspage ${focusedClass} ${renamingCLass} ${noDarknodeClass}`}>
            <div className="statuspage--banner">
                <div className="block--column col-xl-4 statuspage--banner--name">
                    <Blocky address={darknodeID} fgColor="#006FE8" bgColor="transparent" className={!darknodeDetails ? "blocky--loading" : ""} />
                    <div className="statuspage--banner--details">
                        <div className="statuspage--banner--top">
                            {renaming ?
                                <form className="statuspage--rename" onSubmit={handleSubmitName}>
                                    <input
                                        ref={focusInputRef}
                                        type="text"
                                        onChange={handleInput}
                                        value={newName}
                                    />
                                    <button type="submit" className="statuspage--rename--save" disabled={!newName}>
                                        Save
                                    </button>
                                    <button onClick={handleCancelRename}>Cancel</button>
                                </form> :
                                <>
                                    <h3 onClick={name ? handleRename : undefined}>
                                        {name ? name : <DarknodeID darknodeID={darknodeID} />}
                                    </h3>
                                    <button className="statuspage--banner--edit" onClick={handleRename}>
                                        {isOperator ?
                                            (name ? "Edit name" : "Set name") :
                                            (name ? "Edit label" : "Set label")
                                        }
                                        {" "}
                                        <InfoLabel>Darknode names are stored in your browser.</InfoLabel>
                                    </button>
                                    {/* {darknodeDetails ? <button>View details</button> : null} */}
                                </>}
                        </div>
                    </div>
                </div>
                <div className="block--column col-xl-4">
                    <div className="statuspage--banner--right large-only">
                        {notifications}
                    </div>
                </div>
                <div className="block--column col-xl-4">
                    {action === DarknodeAction.Register ?
                        <Registration
                            isOperator
                            registrationStatus={darknodeDetails ?
                                darknodeDetails.registrationStatus :
                                RegistrationStatus.Unknown}
                            darknodeDetails={darknodeDetails}
                            publicKey={publicKey}
                            darknodeID={darknodeID}
                        /> :
                        null
                    }
                    {action !== DarknodeAction.Register && darknodeDetails ?
                        <Registration
                            isOperator={isOperator}
                            registrationStatus={darknodeDetails.registrationStatus}
                            darknodeDetails={darknodeDetails}
                            darknodeID={darknodeID}
                        /> :
                        null
                    }
                </div>
            </div>
            <div className="statuspage--banner--right no-large">
                {notifications}
            </div>
            <div className="statuspage--bottom">
                <FeesBlock isOperator={isOperator} darknodeDetails={darknodeDetails} />
                <div className="block block--column">
                    <VersionBlock darknodeDetails={darknodeDetails} />
                    <GasBlock darknodeDetails={darknodeDetails} />
                    {/* <GasGraph darknodeDetails={darknodeDetails} /> */}
                </div>
                <div className="block block--column">
                    <NetworkBlock darknodeDetails={darknodeDetails} />
                    <ResourcesBlock darknodeDetails={darknodeDetails} />
                    <EpochBlock darknodeDetails={darknodeDetails} />
                </div>
            </div>
        </div>
    );
};

export const StatusPage = connect(mapStateToProps, mapDispatchToProps)(StatusPageClass);
