import { createStandardAction } from "typesafe-actions";

export const setPopup = createStandardAction("setPopup")<{
    popup: JSX.Element;
    overlay?: boolean;
    dismissible?: boolean;
    onCancel(): void;
}>();

export const clearPopup = createStandardAction("clearPopup")();
