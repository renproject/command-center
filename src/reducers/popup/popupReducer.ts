import { ActionType, getType } from "typesafe-actions";

import * as popupActions from "@Actions/popup/popupActions";

import { PopupData } from "@Reducers/types";

type PopupAction = ActionType<typeof popupActions>;

export function popupReducer(state: PopupData = new PopupData(), action: PopupAction) {
    switch (action.type) {
        case getType(popupActions.setPopup):
            if (document.documentElement) {
                document.documentElement.classList.add("noscroll");
            }
            return state
                .set("popup", action.payload.popup)
                .set("dismissible", action.payload.dismissible !== false) // On by default
                .set("overlay", action.payload.overlay === true) // Off by default
                .set("onCancel", action.payload.onCancel);
        case getType(popupActions.clearPopup):
            if (document.documentElement) {
                document.documentElement.classList.remove("noscroll");
            }
            return state.set("popup", null);
        default:
            return state;
    }
}
