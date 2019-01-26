import { createStandardAction } from "typesafe-actions";

export const showMobileMenu = createStandardAction("SHOW_MOBILE_MENU")();
export const hideMobileMenu = createStandardAction("HIDE_MOBILE_MENU")();
