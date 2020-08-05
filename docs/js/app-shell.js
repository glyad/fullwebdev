import { html, render } from "lit-html";

window.html = html;

import appShellTemplate from "./components/app-shell.js";

render(appShellTemplate({ lang: "en" }), document.getElementById("app-shell"));
