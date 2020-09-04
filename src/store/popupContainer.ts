// import { useState } from "react";
import { useState } from "react";
import { createContainer } from "unstated-next";

interface PopupDetails {
  popup: JSX.Element;
  overlay?: boolean;
  dismissible?: boolean;
  onCancel: () => void;
}

const usePopupContainer = () => {
  // const { network, web3 } = Web3Container.useContainer();

  const [popup, setPopupElement] = useState<JSX.Element | null>(null);
  const [overlay, setOverlay] = useState<boolean>(false);
  const [dismissible, setDismissible] = useState<boolean>(true);
  const [onCancel, setOnCancel] = useState<() => void>(() => null);

  const setPopup: (details: PopupDetails) => void = ({
    popup: newPopup,
    overlay: newOverlay,
    dismissible: newDismissible,
    onCancel: newOnCancel,
  }: PopupDetails) => {
    setPopupElement(newPopup);
    setOverlay(newOverlay || false);
    setDismissible(newDismissible || false);
    setOnCancel(() => newOnCancel);
  };

  const clearPopup = () => {
    setPopupElement(null);
    setOverlay(false);
    setDismissible(true);
    setOnCancel(() => null);
  };

  return {
    setPopup,
    clearPopup,
    popup,
    overlay,
    dismissible,
    onCancel,
  };
};

export const PopupContainer = createContainer(usePopupContainer);
