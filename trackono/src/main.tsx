import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "@/theme/theme-provider"
import React from "react";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>

    <ThemeProvider>
      <App />
    </ThemeProvider>,
  </React.StrictMode>
);
