import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ContextStoreProvider } from "./store/ContextStore.jsx";
import { RoleProvider } from "./context/RoleContext.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ContextStoreProvider>
        <RoleProvider>
        <App />

        </RoleProvider>
      </ContextStoreProvider>
    </BrowserRouter>
  </StrictMode>
);
