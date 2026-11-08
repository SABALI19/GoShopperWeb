import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
function SetupNotice() { return <main style={{ maxWidth: 680, margin: "10vh auto", padding: 28, color: "white", fontFamily: "system-ui" }}><h1>Go-Shopper onboarding setup</h1><p>Configure <code>VITE_CLERK_PUBLISHABLE_KEY</code> and <code>VITE_API_URL</code> in <code>onboarding-web/.env</code>, then restart the Vite development server.</p></main>; }
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {publishableKey ? <ClerkProvider publishableKey={publishableKey}><BrowserRouter><App /></BrowserRouter></ClerkProvider> : <SetupNotice />}
  </React.StrictMode>,
);
