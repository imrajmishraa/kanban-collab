import { BrowserRouter } from "react-router-dom";

import { AppRouter } from "@app/router";
import { ThemeProvider } from "./providers/ThemeProvider";
import QueryProvider from "./providers/QueryProvider";
import ScrollToTop from "./ScrollToTop";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <QueryProvider>
          <AppRouter />
        </QueryProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
