import { ActionType, getType } from "typesafe-actions";

import { UIState } from "../applicationState";
import * as uiActions from "./uiActions";

type UIAction = ActionType<typeof uiActions>;

export const uiReducer = (state: UIState = new UIState(), action: UIAction): UIState => {
    switch (action.type) {
        case getType(uiActions.showMobileMenu):
            return state.set("mobileMenuActive", true);
        case getType(uiActions.hideMobileMenu):
            return state.set("mobileMenuActive", false);
        default:
            return state;
    }
};
