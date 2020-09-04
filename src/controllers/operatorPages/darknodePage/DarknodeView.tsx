import { Blocky, InfoLabel } from "@renproject/react-components";
import React, { useEffect, useRef, useState } from "react";

import { NULL, RegistrationStatus } from "../../../lib/ethereum/contractReads";
import { GraphContainer } from "../../../store/graphContainer";
import { DarknodesState } from "../../../store/networkContainer";
import { DarknodeID } from "../../../views/DarknodeID";
import { EpochBlock } from "./blocks/EpochBlock";
import { FeesBlock } from "./blocks/FeesBlock";
import { GasBlock } from "./blocks/GasBlock";
import { NetworkBlock } from "./blocks/NetworkBlock";
import { ResourcesBlock } from "./blocks/ResourcesBlock";
import { VersionBlock } from "./blocks/VersionBlock";
import { DarknodeAction } from "./DarknodePage";
import { Notifications } from "./Notifications";
import { Registration } from "./Registration";

interface Props {
  action: DarknodeAction;
  isOperator: boolean;

  darknodeID: string;
  darknodeDetails: DarknodesState | null;
  name: string | undefined;
  storeDarknodeName: (darknodeID: string, name: string) => void;
  publicKey: string | undefined;
}

export const DarknodeView: React.FC<Props> = ({
  darknodeDetails,
  darknodeID,
  name,
  isOperator,
  action,
  storeDarknodeName,
  publicKey,
}) => {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState<string | undefined>(name);

  const { renVM } = GraphContainer.useContainer();
  const { timeUntilNextEpoch, timeSinceLastEpoch, minimumEpochInterval } =
    renVM || {};

  const focusInputRef = useRef<HTMLInputElement | null>(null);

  const handleInput = (event: React.FormEvent<HTMLInputElement>): void => {
    const element = event.target as HTMLInputElement;
    setNewName(element.value);
  };

  const handleRename = (): void => {
    // Use setState callback to set focus to input (otherwise, input will
    // not have been rendered yet)
    setRenaming(true);
  };

  useEffect(() => {
    // Focus input field when renaming is set to true
    if (renaming && focusInputRef) {
      const current = focusInputRef.current;
      if (current) {
        current.focus();
      }
    }
  }, [renaming]);

  const handleCancelRename = () => {
    setRenaming(false);
  };

  const handleSubmitName = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newName) {
      return;
    }

    setRenaming(false);
    storeDarknodeName(darknodeID, newName);
  };

  useEffect(() => {
    if (newName === undefined && name !== undefined) {
      setNewName(name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const focusedClass =
    action !== DarknodeAction.View ? "darknodePage--focused" : "";
  const renamingCLass = renaming ? "darknodePage--renaming" : "";
  const noDarknodeClass =
    noDarknode || !darknodeDetails ? "darknodePage--no-darknode" : "";

  const notifications = (
    <Notifications isOperator={isOperator} darknodeDetails={darknodeDetails} />
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
            <div className="darknodePage--banner--top">
              {renaming ? (
                <form
                  className="darknodePage--rename"
                  onSubmit={handleSubmitName}
                >
                  <input
                    ref={focusInputRef}
                    type="text"
                    onChange={handleInput}
                    value={newName}
                  />
                  <button
                    type="submit"
                    className="darknodePage--rename--save"
                    disabled={!newName}
                  >
                    Save
                  </button>
                  <button onClick={handleCancelRename}>Cancel</button>
                </form>
              ) : (
                <>
                  <h3 onClick={name ? handleRename : undefined}>
                    {name ? name : <DarknodeID darknodeID={darknodeID} />}
                  </h3>
                  <button
                    className="darknodePage--banner--edit"
                    onClick={handleRename}
                  >
                    {isOperator
                      ? name
                        ? "Edit name"
                        : "Set name"
                      : name
                      ? "Edit label"
                      : "Set label"}{" "}
                    <InfoLabel>
                      Darknode names are stored in your browser.
                    </InfoLabel>
                  </button>
                  {/* {darknodeDetails ? <button>View details</button> : null} */}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="block--column col-xl-4 col-lg-12">
          <div className="darknodePage--banner--right xl-or-larger">
            {notifications}
          </div>
        </div>
        <div className="block--column col-xl-4 col-lg-12">
          {action === DarknodeAction.Register ? (
            <Registration
              isOperator
              registrationStatus={
                darknodeDetails
                  ? darknodeDetails.registrationStatus
                  : RegistrationStatus.Unknown
              }
              darknodeDetails={darknodeDetails}
              publicKey={publicKey}
              darknodeID={darknodeID}
            />
          ) : darknodeDetails ? (
            <Registration
              isOperator={isOperator}
              registrationStatus={darknodeDetails.registrationStatus}
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
        <FeesBlock isOperator={isOperator} darknodeDetails={darknodeDetails} />
        <div className="block block--column">
          <VersionBlock darknodeDetails={darknodeDetails} />
          <GasBlock darknodeDetails={darknodeDetails} />
          {/* <GasGraph darknodeDetails={darknodeDetails} /> */}
        </div>
        <div className="block block--column">
          <NetworkBlock darknodeDetails={darknodeDetails} />
          <ResourcesBlock darknodeDetails={darknodeDetails} />
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
