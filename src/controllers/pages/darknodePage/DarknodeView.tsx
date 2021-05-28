import { Blocky } from "@renproject/react-components";
import React, { useState } from "react";

import { NULL, RegistrationStatus } from "../../../lib/ethereum/contractReads";
import { GraphContainer } from "../../../store/graphContainer";
import { DarknodesState } from "../../../store/networkContainer";
import { DarknodeName } from "../../../views/darknodeBlocks/DarknodeName";
import { EpochBlock } from "../../../views/darknodeBlocks/EpochBlock";
import { NetworkBlock } from "../../../views/darknodeBlocks/NetworkBlock";
import { ResourcesBlock } from "../../../views/darknodeBlocks/ResourcesBlock";
import { FeesSwitcherController } from "./blocks/FeesBlockController";
import { GasBlockController } from "./blocks/GasBlockController";
import { VersionBlockController } from "./blocks/VersionBlockController";
import { DarknodeAction } from "./DarknodePage";
import { Notifications } from "./Notifications";
import { RegistrationController } from "./RegistrationController";

interface Props {
    action: DarknodeAction;
    isOperator: boolean;

    darknodeID: string;
    darknodeDetails: DarknodesState | null;
    name: string | undefined;
    storeDarknodeName: (darknodeID: string, name: string) => void;
}

export const DarknodeView: React.FC<Props> = ({
    darknodeDetails,
    darknodeID,
    name,
    isOperator,
    action,
    storeDarknodeName,
}) => {
    const [renaming, setRenaming] = useState(false);
    const { renVM } = GraphContainer.useContainer();
    const { timeUntilNextEpoch, timeSinceLastEpoch, minimumEpochInterval } =
        renVM || {};

    let noDarknode;
    if (
        darknodeDetails &&
        action !== DarknodeAction.Register &&
        darknodeDetails.registrationStatus ===
            RegistrationStatus.Unregistered &&
        darknodeDetails.operator === NULL
    ) {
        noDarknode = true;
    }

    const focusedClass =
        action !== DarknodeAction.View ? "darknodePage--focused" : "";
    const renamingCLass = renaming ? "darknodePage--renaming" : "";
    const noDarknodeClass =
        noDarknode || !darknodeDetails ? "darknodePage--no-darknode" : "";

    const notifications = (
        <Notifications
            isOperator={isOperator}
            darknodeDetails={darknodeDetails}
        />
    );

    return (
        <div
            className={`container darknodePage ${focusedClass} ${renamingCLass} ${noDarknodeClass}`}
        >
            <div className="darknodePage--banner">
                <div className="block--column col-xl-4 col-lg-12 darknodePage--banner--name">
                    <Blocky
                        address={darknodeID}
                        fgColor="#006FE8"
                        bgColor="transparent"
                        className={!darknodeDetails ? "blocky--loading" : ""}
                    />
                    <div className="darknodePage--banner--details">
                        <DarknodeName
                            renaming={renaming}
                            setRenaming={setRenaming}
                            isOperator={isOperator}
                            darknodeID={darknodeID}
                            name={name}
                            storeDarknodeName={storeDarknodeName}
                        />
                    </div>
                </div>
                <div className="block--column col-xl-4 col-lg-12">
                    <div className="darknodePage--banner--right xl-or-larger">
                        {notifications}
                    </div>
                </div>
                <div className="block--column col-xl-4 col-lg-12">
                    {action === DarknodeAction.Register ? (
                        <RegistrationController
                            action={action}
                            registrationStatus={
                                darknodeDetails
                                    ? darknodeDetails.registrationStatus
                                    : RegistrationStatus.Unknown
                            }
                            darknodeDetails={darknodeDetails}
                            darknodeID={darknodeID}
                        />
                    ) : darknodeDetails ? (
                        <RegistrationController
                            action={action}
                            registrationStatus={
                                darknodeDetails.registrationStatus
                            }
                            darknodeDetails={darknodeDetails}
                            darknodeID={darknodeID}
                        />
                    ) : null}
                </div>
            </div>
            <div className="darknodePage--banner--right no-xl-or-larger">
                {notifications}
            </div>
            <div className="darknodePage--bottom">
                <div className="block block--column">
                    <FeesSwitcherController
                        isOperator={isOperator}
                        darknodeDetails={darknodeDetails}
                    />
                </div>
                <div className="block block--column">
                    <VersionBlockController darknodeDetails={darknodeDetails} />
                    <GasBlockController
                        darknodeID={darknodeID}
                        darknodeDetails={darknodeDetails}
                    />
                    {/* <GasGraph darknodeDetails={darknodeDetails} /> */}
                </div>
                <div className="block block--column">
                    <NetworkBlock
                        darknodeID={darknodeDetails && darknodeDetails.ID}
                        nodeStatistics={
                            darknodeDetails && darknodeDetails.nodeStatistics
                        }
                    />
                    <ResourcesBlock
                        nodeStatistics={
                            darknodeDetails && darknodeDetails.nodeStatistics
                        }
                    />
                    <EpochBlock
                        timeUntilNextEpoch={timeUntilNextEpoch}
                        timeSinceLastEpoch={timeSinceLastEpoch}
                        minimumEpochInterval={minimumEpochInterval}
                    />
                </div>
            </div>
        </div>
    );
};
