import "react-app-polyfill/stable";
import { createRoot } from "react-dom/client";

import "./styles/styles.global.css";
import { Main } from "./Main.js";

const domNode = document.getElementById("root");

if (domNode) {
    createRoot(domNode).render(<Main />);
}

// https://vite.dev/guide/build#load-error-handling
window.addEventListener("vite:preloadError", () => {
    window.location.reload();
});
