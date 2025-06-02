import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import { Studio } from "./Studio";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Studio />
  </StrictMode>,
);
