import { ActionType, getType } from "typesafe-actions";

import * as popupActions from "../../actions/popup/popupActions";

import { PopupData } from "../../reducers/types";

type PopupAction = ActionType<typeof popupActions>;

export const popupReducer = (state: PopupData = new PopupData(), action: PopupAction): PopupData => {
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
