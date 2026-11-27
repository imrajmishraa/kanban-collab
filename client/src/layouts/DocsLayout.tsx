import { useCallback, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import DocsNavbar from "@/components/docs/DocsNavbar";
import DocsPagination from "@/components/docs/DocsPagination";
import DocsSidebarLeft from "@/components/docs/DocsSidebarLeft";
import DocsSidebarMobile from "@/components/docs/DocsSidebarMobile";
import DocsSidebarRight from "@/components/docs/DocsSidebarRight";
import { useTableOfContents } from "@/components/docs/useTableOfContents";
import { useDocsSidebarState } from "@/stores/docsSidebar";

export default function DocsLayout() {
  const articleRef = useRef<HTMLElement>(null);
  const { items, activeId } = useTableOfContents(articleRef);
  const [navOpen, setNavOpen] = useState(false);

  /* From the store, not `useState`: collapsing the column is a preference, and a
     reload used to bring it back open. */
  const collapsed = useDocsSidebarState((state) => state.collapsed);
  const toggleCollapsed = useDocsSidebarState((state) => state.toggleCollapsed);
  const { pathname } = useLocation();

  /* A route change closes the drawer, otherwise it stays open over the page the
     reader just navigated to. */
  const closeNav = useCallback(() => setNavOpen(false), []);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (navOpen) setNavOpen(false);
  }

  return (
    <div className="min-h-screen bg-(--bg-root) font-sans">
      <DocsNavbar
        onOpenNav={() => setNavOpen((value) => !value)}
        navOpen={navOpen}
      />

      <DocsSidebarMobile open={navOpen} onClose={closeNav} />

      <div className="mx-auto flex w-full max-w-384 gap-8 border-x border-b border-(--hairline) px-4 sm:px-6">
        <DocsSidebarLeft collapsed={collapsed} onToggle={toggleCollapsed} />

        <main className="mx-auto min-w-0 max-w-full flex-1 px-0 pt-10 pb-10 md:px-4">
          <article ref={articleRef} className="">
            <Outlet />
          </article>

          <DocsPagination />
        </main>

        <DocsSidebarRight items={items} activeId={activeId} />
      </div>
    </div>
  );
}
