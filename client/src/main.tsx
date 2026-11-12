import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";

import "@fontsource-variable/figtree";
import "@fontsource-variable/jetbrains-mono";
import "./index.css";

import App from "./app/App";
import { Boot } from "./app/Boot";
import { queryClient } from "./app/providers/queryClient";
import { Toaster } from "@/components/toaster/Toaster";
import { installThemeMatcher } from "@/stores/theme";

// Single QueryClient for the whole app (F-7). It is created once in
// QueryProvider and reused here, so there is exactly one cache. Re-exported so
// it can be used imperatively (invalidateQueries / setQueryData) from anywhere.
export { queryClient };

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root element");

/* The universal theme matcher, once, before anything renders: a stored choice
   wins, and with nothing stored the OS decides and keeps deciding. `index.html`
   has already painted the same answer; this binds the document to the store and
   starts the one OS listener the app has. */
installThemeMatcher();

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Boot>
        <App />
      </Boot>
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
