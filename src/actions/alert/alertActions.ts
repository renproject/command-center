import { createStandardAction } from "typesafe-actions";

import { Alert } from "@Reducers/types";

/**
 * Adds a new alert to the alert stack
 * @param {{ alert: Alert }} payload - the alert to be added to the stack
 */
interface SetAlertPayload { alert: Alert; }
export type SetAlertAction = (payload: SetAlertPayload) => void;
export const setAlert = createStandardAction("SET_ALERT")<SetAlertPayload>();

/**
 * Remove the top alert from the alert stack
 */
export type ClearAlertAction = () => void;
export const clearAlert = createStandardAction("CLEAR_ALERT")();
