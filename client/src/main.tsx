import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./app/App";
import { Boot } from "./app/Boot";
import { Toaster } from "@/components/ui/toaster/Toaster";
import { ThemeProvider } from "./app/providers/ThemeProvider";

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root element");

createRoot(container).render(
  <StrictMode>
    <ThemeProvider>
      <Boot>
        <App />
      </Boot>
      <Toaster />
    </ThemeProvider>
  </StrictMode>,
);
