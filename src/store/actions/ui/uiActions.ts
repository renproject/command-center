import { createStandardAction } from "typesafe-actions";

export const showMobileMenu = createStandardAction("showMobileMenu")();
export const hideMobileMenu = createStandardAction("hideMobileMenu")();
