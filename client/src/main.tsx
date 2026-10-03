import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";

import App from "./app/App";
import { Boot } from "./app/Boot";
import { Toaster } from "@/components/ui/toaster/Toaster";

// Exported so you can call queryClient.invalidateQueries/setQueryData
// from anywhere (e.g. after creating a board, to refresh the list).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // data stays fresh for 30s
      refetchOnWindowFocus: false, // no refetch storm on tab switching
      retry: 1,
    },
  },
});

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
