import { Outlet } from "react-router-dom";

import Sidebar from "@/components/layout/workspace/Sidebar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-(--bg-root) text-(--text-primary)">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
