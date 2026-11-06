import { useCallback, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import DocsNav from "@/components/docs/DocsNavbar";
import DocsPagination from "@/components/docs/DocsPagination";
import DocsSidebarLeft from "@/components/docs/DocsSidebarLeft";
import DocsSidebarMobile from "@/components/docs/DocsSidebarMobile";
import DocsSidebarRight from "@/components/docs/DocsSidebarRight";
import { useTableOfContents } from "@/components/docs/useTableOfContents";

export default function DocsLayout() {
  const articleRef = useRef<HTMLElement>(null);
  const { items, activeId } = useTableOfContents(articleRef);
  const [navOpen, setNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
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
      <DocsNav
        onOpenNav={() => setNavOpen((value) => !value)}
        navOpen={navOpen}
      />

      <DocsSidebarMobile open={navOpen} onClose={closeNav} />

      <div className="mx-auto flex w-full max-w-384 gap-8 border-x border-b border-(--hairline) px-4 sm:px-6">
        <DocsSidebarLeft
          collapsed={collapsed}
          onToggle={() => setCollapsed((value) => !value)}
        />

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
