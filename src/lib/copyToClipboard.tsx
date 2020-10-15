export const copyToClipboard = (element: Element): void => {
  const value = element.getAttribute("data-addr");
  if (value) {
    const fauxInput = document.createElement("input");
    document.body.appendChild(fauxInput);
    fauxInput.setAttribute("value", value);
    fauxInput.select();
    document.execCommand("copy");
    document.body.removeChild(fauxInput);
  }
};
