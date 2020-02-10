import { ActionType, getType } from "typesafe-actions";

import { PopupState } from "../applicationState";
import * as popupActions from "./popupActions";

type PopupAction = ActionType<typeof popupActions>;

export const popupReducer = (state: PopupState = new PopupState(), action: PopupAction): PopupState => {
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
            return state.set("popup", null)
                .set("overlay", false)
                .set("dismissible", true)
                .set("onCancel", (() => null) as () => void);
        default:
            return state;
    }
};
