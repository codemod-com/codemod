import ReactDom from "react-dom";
import { createRoot } from "react-dom/client";
console.log(createRoot);

import Component from "Component";

ReactDom.hydrate(<Component />, document.getElementById("app"));
