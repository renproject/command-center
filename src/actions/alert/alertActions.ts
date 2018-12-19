import { createStandardAction } from "typesafe-actions";

import { Alert } from "@Reducers/types";

/**
 * Adds a new alert to the alert stack
 * @param {{ alert: Alert }} payload - the alert to be added to the stack
 */
export const setAlert = createStandardAction("SET_ALERT")<{ alert: Alert; }>();

/**
 * Remove the top alert from the alert stack
 */
export const clearAlert = createStandardAction("CLEAR_ALERT")();
