import { ActionType, getType } from "typesafe-actions";

import * as alertActions from "../../actions/alert/alertActions";

import { Alert, AlertData } from "../../reducers/types";

type AlertAction = ActionType<typeof alertActions>;

export function alertReducer(state: AlertData = new AlertData(), action: AlertAction) {
    switch (action.type) {
        case getType(alertActions.setAlert):
            return state.set("alert", action.payload.alert);
        case getType(alertActions.clearAlert):
            return state.set("alert", new Alert({ message: "" }));
        default:
            return state;
    }
}
