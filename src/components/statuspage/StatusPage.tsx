import * as React from "react";

import { Blocky } from "@renex/react-components";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators, Dispatch } from "redux";

import { RegistrationStatus, setDarknodeName } from "../../store/actions/statistics/operatorActions";
import { ApplicationData, DarknodeDetails } from "../../store/types";
import { DarknodeID } from "../DarknodeID";
import { InfoLabel } from "../InfoLabel";
import { DarknodeAction } from "../pages/Darknode";
import { FeesBlock } from "./block/FeesBlock";
import { GasBlock } from "./block/GasBlock";
import { GasGraph } from "./block/GasGraph";
import { NetworkBlock } from "./block/NetworkBlock";
import { Notifications } from "./Notifications";
import { Registration } from "./Registration";

const defaultState = { // Entries must be immutable
    renaming: false,
    newName: undefined as string | undefined,
};

class StatusPageClass extends React.Component<Props, State> {
    private focusInput: HTMLInputElement | null = null;

    public constructor(props: Props, context: object) {
        super(props, context);
        this.state = { ...defaultState, newName: props.name };
    }

    public componentWillReceiveProps = (nextProps: Props) => {
        if (this.state.newName === undefined && nextProps.name !== undefined) {
            this.setState({ newName: nextProps.name });
        }
    }

    public render = (): JSX.Element => {
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

        const notifications = <Notifications isOperator={isOperator} darknodeDetails={darknodeDetails} />;

        return (
            <div className={`statuspage ${focusedClass} ${renamingCLass} ${noDarknodeClass}`}>
                <div className="statuspage--banner">
                    <Blocky address={darknodeID} fgColor="#006FE8" bgColor="transparent" />
                    <div className="statuspage--banner--details">
                        <div className="statuspage--banner--top">
                            {renaming ?
                                <form className="statuspage--rename" onSubmit={this.handleSubmitName}>
                                    <input
                                        ref={this.focusInputRef}
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
                                    <button className="statuspage--banner--edit" onClick={this.handleRename}>
                                        {name ? "Edit name" : "Set name"}
                                        {" "}
                                        <InfoLabel>Darknode names are stored in your browser.</InfoLabel>
                                    </button>
                                    {/* {darknodeDetails ? <button>View details</button> : null} */}
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
                    <div className="statuspage--banner--right large-only">
                        {notifications}
                    </div>
                </div>
                <div className="statuspage--banner--right no-large">
                    {notifications}
                </div>
                <div className="statuspage--bottom">
                    <FeesBlock isOperator={isOperator} darknodeDetails={darknodeDetails} />
                    <GasBlock darknodeDetails={darknodeDetails} />
                    <div className="block statuspage--graphs">
                        <GasGraph darknodeDetails={darknodeDetails} />
                        <NetworkBlock darknodeDetails={darknodeDetails} />
                    </div>
                </div>
            </div>
        );
    }

    private readonly focusInputRef = (c: HTMLInputElement | null) => this.focusInput = c;

    private readonly handleInput = (event: React.FormEvent<HTMLInputElement>): void => {
        const element = (event.target as HTMLInputElement);
        this.setState((current: State) => ({ ...current, [element.name]: element.value }));
    }

    private readonly handleRename = (): void => {
        // Use setState callback to set focus to input (otherwise, input will
        // not have been rendered yet)
        this.setState({ renaming: true }, () => {
            if (this.focusInput) {
                this.focusInput.focus();
            }
        });
    }

    private readonly handleCancelRename = () => {
        this.setState({ renaming: false });
    }

    private readonly handleSubmitName = (e: React.FormEvent<HTMLFormElement>) => {
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

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    action: DarknodeAction;
    isOperator: boolean;

    darknodeID: string;
    darknodeDetails: DarknodeDetails | null;
    name: string | undefined;
    publicKey: string | undefined;
}

type State = typeof defaultState;

export const StatusPage = connect(mapStateToProps, mapDispatchToProps)(StatusPageClass);
