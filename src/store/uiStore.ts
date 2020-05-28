import { useCallback, useState } from "react";
import { createContainer } from "unstated-next";

const useUIContainer = () => {
    const [mobileMenuActive, setMobileMenuActive] = useState(false);

    const showMobileMenu = useCallback(() => {
        setMobileMenuActive(true);
    }, [setMobileMenuActive]);

    const hideMobileMenu = useCallback(() => {
        setMobileMenuActive(false);
    }, [setMobileMenuActive]);

    return { mobileMenuActive, showMobileMenu, hideMobileMenu };
};

export const UIContainer = createContainer(useUIContainer);
