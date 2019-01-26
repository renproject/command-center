import { ActionType, getType } from "typesafe-actions";

import * as uiActions from "../../actions/ui/uiActions";

import { UIData } from "../types";

type UIAction = ActionType<typeof uiActions>;

export const uiReducer = (state: UIData = new UIData(), action: UIAction): UIData => {
    switch (action.type) {
        case getType(uiActions.showMobileMenu):
            console.log("showMobileMenu");
            return state.set("mobileMenuActive", true);
        case getType(uiActions.hideMobileMenu):
            console.log("hideMobileMenu");
            return state.set("mobileMenuActive", false);
        default:
            return state;
    }
};
