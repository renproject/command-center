import { createAction } from "typesafe-actions";

export const setPopup = createAction("SET_POPUP")<{
    popup: JSX.Element;
    overlay?: boolean;
    dismissible?: boolean;
    onCancel(): void;
}>();

export const clearPopup = createAction("CLEAR_POPUP")();
