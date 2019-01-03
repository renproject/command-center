import * as React from "react";

import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { RegistrationStatus, setDarknodeName } from "../../actions/statistics/operatorActions";
import { Blocky } from "../../components/Blocky";
import { DarknodeID } from "../../components/DarknodeID";
import { InfoLabel } from "../../components/InfoLabel";
import { DarknodeAction } from "../../components/pages/Darknode";
import { ApplicationData, DarknodeDetails } from "../../reducers/types";
import { FeesBlock } from "./block/FeesBlock";
import { GasBlock } from "./block/GasBlock";
import { NetworkBlock } from "./block/NetworkBlock";
import { Notifications } from "./Notifications";
import { Registration } from "./Registration";

interface StatusPageProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    action: DarknodeAction;
    isOperator: boolean;

    darknodeID: string;
    darknodeDetails: DarknodeDetails | null;
    name: string | undefined;
    publicKey: string | undefined;
}

interface StatusPageState {
    renaming: boolean;
    newName: string | undefined;
}

class StatusPageClass extends React.Component<StatusPageProps, StatusPageState> {
    private focusInput: HTMLInputElement | null = null;

    public constructor(props: StatusPageProps, context: object) {
        super(props, context);
        this.state = {
            renaming: false,
            newName: props.name,
        };
    }

    public componentWillReceiveProps = (nextProps: StatusPageProps) => {
        if (this.state.newName === undefined && nextProps.name !== undefined) {
            this.setState({ newName: nextProps.name });
        }
    }

    public render(): JSX.Element {
        const { darknodeDetails, darknodeID, name, isOperator, action, publicKey } = this.props;
        const { renaming, newName } = this.state;

        let noDarknode;
        if (
            darknodeDetails &&
            action !== DarknodeAction.Register &&
            darknodeDetails.registrationStatus === RegistrationStatus.Unregistered &&
            darknodeDetails.operator === "0x0000000000000000000000000000000000000000"
        ) {
            noDarknode = true;
        }

        const focusedClass = action !== DarknodeAction.View ? "statuspage--focused" : "";
        const renamingCLass = renaming ? "statuspage--renaming" : "";
        const noDarknodeClass = noDarknode ? "statuspage--no-darknode" : "";

        return (
            <div className={`statuspage ${focusedClass} ${renamingCLass} ${noDarknodeClass}`}>
                <div className="statuspage--banner">
                    <Blocky address={darknodeID} fgColor="#006FE8" bgColor="transparent" />
                    <div className="statuspage--banner--details">
                        <div className="statuspage--banner--top">
                            {renaming ?
                                <form className="statuspage--rename" onSubmit={this.handleSubmitName}>
                                    <input
                                        ref={(c) => this.focusInput = c}
                                        role="textbox"
                                        type="text"
                                        name="newName"
                                        onChange={this.handleInput}
                                        value={newName}
                                    />
                                    <button type="submit" className="statuspage--rename--save" disabled={!newName}>
                                        Save
                                    </button>
                                    <button onClick={this.handleCancelRename}>Cancel</button>
                                </form> :
                                <>
                                    <h3 onClick={name ? this.handleRename : undefined}>
                                        {name ? name : <DarknodeID darknodeID={darknodeID} />}
                                    </h3>
                                    <button onClick={this.handleRename}>
                                        {name ? "Edit name" : "Set name"}
                                        {" "}
                                        <InfoLabel>Darknode names are stored in your browser.</InfoLabel>
                                    </button>
                                    {darknodeDetails ? <button>View details</button> : null}
                                </>}
                        </div>

                        {action === DarknodeAction.Register ?
                            <Registration
                                isOperator={true}
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
                    <Notifications isOperator={isOperator} darknodeDetails={darknodeDetails} />
                </div>
                <div className="statuspage--bottom">
                    <FeesBlock isOperator={isOperator} darknodeDetails={darknodeDetails} />
                    <GasBlock darknodeDetails={darknodeDetails} />
                    <NetworkBlock darknodeDetails={darknodeDetails} />
                </div>
            </div>
        );
    }

    private handleInput = (event: React.FormEvent<HTMLInputElement>): void => {
        const element = (event.target as HTMLInputElement);
        this.setState((current) => ({ ...current, [element.name]: element.value }));
    }

    private handleRename = () => {
        // Use setState callback to set focus to input (otherwise, input will
        // not have been rendered yet)
        this.setState({ renaming: true }, () => {
            if (this.focusInput) {
                this.focusInput.focus();
            }
        });
    }

    private handleCancelRename = () => {
        this.setState({ renaming: false });
    }

    private handleSubmitName = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const { darknodeID } = this.props;
        const { newName } = this.state;

        if (!newName) {
            return;
        }

        this.setState({ renaming: false });
        this.props.actions.setDarknodeName({ darknodeID, name: newName });
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        tokenPrices: state.statistics.tokenPrices,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        setDarknodeName,
    }, dispatch),
});

export const StatusPage = connect(mapStateToProps, mapDispatchToProps)(StatusPageClass);
