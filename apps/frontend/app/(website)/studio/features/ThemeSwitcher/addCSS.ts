export function addCSS(cssRules: string) {
  const style = document.createElement("style");
  style.type = "text/css";
  style.appendChild(document.createTextNode(cssRules));
  document.head.appendChild(style);
}
