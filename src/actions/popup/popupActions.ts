import { createStandardAction } from "typesafe-actions";

export interface SetPopupPayload { popup: JSX.Element; overlay?: boolean; dismissible?: boolean; onCancel(): void; }
export type SetPopupAction = (payload: SetPopupPayload) => void;
export const setPopup = createStandardAction("SET_POPUP")<SetPopupPayload>();

export type ClearPopupAction = () => void;
export const clearPopup = createStandardAction("CLEAR_POPUP")();
