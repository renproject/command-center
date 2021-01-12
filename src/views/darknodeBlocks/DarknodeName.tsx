import { InfoLabel } from "@renproject/react-components";
import React, { useEffect, useRef, useState } from "react";

import { DarknodeID } from "../DarknodeID";

interface Props {
    renaming: boolean;
    setRenaming: (renaming: boolean) => void;
    isOperator: boolean;
    darknodeID: string;
    name: string | undefined;
    storeDarknodeName: (darknodeID: string, name: string) => void;
}

export const DarknodeName: React.FC<Props> = ({
    renaming,
    setRenaming,
    darknodeID,
    name,
    isOperator,
    storeDarknodeName,
}) => {
    const [newName, setNewName] = useState<string | undefined>(name);

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

    return (
        <div className="darknode--rename">
            {renaming ? (
                <form
                    className="darknode--rename--form"
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
                        className="darknode--rename--form--save"
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
                        className="darknode--rename-edit"
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
                </>
            )}
        </div>
    );
};
