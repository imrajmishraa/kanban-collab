import { Link, useLocation } from "react-router-dom";

import KanbanIcon from "@/assets/KanbanIcon";

export default function AuthNavbar() {
  const { pathname } = useLocation();

  const onRegister = pathname.startsWith("/auth/register");

  const swap = onRegister
    ? { label: "Log in", to: "/auth/login" }
    : { label: "Sign up", to: "/auth/register" };

  return (
    <header
      className={[
        "sticky top-0 z-40 mx-auto h-16",
        "bg-(--bg-root) text-(--text-primary)",
      ].join(" ")}
    >
      <div className="relative m-auto flex h-18 max-w- items-center justify-between gap-4 px-4 pt-1.5 sm:px-7">
        <Link
          to="/home"
          aria-label="Kanban — home"
          className="flex min-w-0 shrink items-center gap-3 rounded-full focus-visible:ring-2 focus-visible:ring-[rgb(52,92,58)] focus-visible:outline-hidden"
        >
          <KanbanIcon
            size={24}
            variant="upper"
            theme="auto"
            className="shrink-0 transition-transform duration-150 group-hover/logo:scale-110"
          />
        </Link>

        <Link
          to={swap.to}
          className={[
            "inline-flex h-10 shrink-0 items-center justify-center rounded-lg border px-5",
            "text-[13.5px] font-bold text-(--text-primary)",
            "bg-(--text-subtle)/10 border-(--text-subtle)",
            "transition-colors duration-150 hover:border-(--text-subtle)/60",
            "focus-visible:ring-2 focus-visible:ring-[rgb(52,92,58)] focus-visible:outline-hidden",
            "motion-reduce:transition-none",
          ].join(" ")}
        >
          {swap.label}
        </Link>
      </div>
    </header>
  );
}
