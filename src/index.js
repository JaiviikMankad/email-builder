import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "@progress/kendo-theme-default/dist/all.css";


const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
