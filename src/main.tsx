import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChallengeApp } from "./components/challenge-app";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChallengeApp />
  </StrictMode>,
);
