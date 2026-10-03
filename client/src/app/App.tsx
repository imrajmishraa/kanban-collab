import { BrowserRouter } from "react-router-dom";

import { AppRouter } from "@app/router";
import QueryProvider from "./providers/QueryProvider";
import ScrollToTop from "./ScrollToTop";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <QueryProvider>
        <AppRouter />
      </QueryProvider>
    </BrowserRouter>
  );
}
