import { useCallback, useState } from "react";
import { createContainer } from "unstated-next";

const useUIContainer = () => {
    const [mobileMenuActive, setMobileMenuActive] = useState(false);
    const [selectedDarknodeID, setSelectedDarknodeID] = useState<
        string | undefined
    >(undefined);

    const showMobileMenu = useCallback(() => {
        setMobileMenuActive(true);
    }, [setMobileMenuActive]);

    const hideMobileMenu = useCallback(() => {
        setMobileMenuActive(false);
    }, [setMobileMenuActive]);

    return {
        mobileMenuActive,
        showMobileMenu,
        hideMobileMenu,
        selectedDarknodeID,
        setSelectedDarknodeID,
    };
};

export const UIContainer = createContainer(useUIContainer);
