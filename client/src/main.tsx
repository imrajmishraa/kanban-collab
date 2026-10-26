import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";

import "./index.css";

import App from "./app/App";
import { Boot } from "./app/Boot";
import { queryClient } from "./app/providers/queryClient";
import { Toaster } from "@/components/ui/toaster/Toaster";

// Single QueryClient for the whole app (F-7). It is created once in
// QueryProvider and reused here, so there is exactly one cache. Re-exported so
// it can be used imperatively (invalidateQueries / setQueryData) from anywhere.
export { queryClient };

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root element");

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
