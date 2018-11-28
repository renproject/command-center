import { createStandardAction } from "typesafe-actions";


interface AddPendingAlertPayload { id: string; method: () => Promise<void>; }
export type AddPendingAlertAction = (payload: AddPendingAlertPayload) => void;
export const addPendingAlert = createStandardAction("ADD_PENDING_ALERT")<AddPendingAlertPayload>();

interface RemovePendingAlertsPayload { ids: string[]; }
export type RemovePendingAlertsAction = (payload: RemovePendingAlertsPayload) => void;
export const removePendingAlerts = createStandardAction("REMOVE_PENDING_ALERTS")<RemovePendingAlertsPayload>();
