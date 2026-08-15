import { Outlet } from "react-router-dom";

import Footer from "@/components/layout/landing/Footer";
import Navbar from "@/components/layout/landing/Navbar";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-(--bg-root) text-(--text-primary)">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
