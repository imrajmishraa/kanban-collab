import { Link } from "react-router-dom";

const productLinks = [
  {
    label: "Features",
    href: "/features",
  },
  {
    label: "How it Works",
    href: "/how-it-works",
  },
];

const resourceLinks = [
  {
    label: "GitHub",
    href: "https://github.com/imrajmishraa/kanban-collab",
    external: true,
  },
  {
    label: "Login",
    href: "/auth/login",
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-800 bg-[#0c0c0e] text-neutral-300">
      <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8">
        {/* MAIN FOOTER */}
        <div className="grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr] lg:py-14">
          {/* BRAND */}
          <div className="max-w-sm">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 font-mono text-xl font-bold tracking-tight text-neutral-100"
            >
              <span className="font-extrabold text-rose-500 transition-transform duration-200 group-hover:translate-x-0.5">
                &gt;
              </span>

              <span>Kanban</span>
            </Link>

            <p className="mt-4 max-w-xs font-mono text-sm leading-6 text-neutral-500">
              Real-time collaborative boards for teams that want to organize
              work and get things done.
            </p>

            {/* Terminal-style status */}
            <div className="mt-6 inline-flex items-center gap-2 border border-neutral-800 bg-neutral-900/50 px-3 py-2 font-mono text-xs text-neutral-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>All systems operational</span>
            </div>
          </div>

          {/* PRODUCT */}
          <div>
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-neutral-300">
              Product
            </h2>

            <nav className="mt-5 flex flex-col gap-3">
              {productLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="group inline-flex w-fit items-center gap-2 font-mono text-sm text-neutral-500 transition-colors duration-200 hover:text-neutral-100"
                >
                  <span className="text-neutral-700 transition-colors group-hover:text-rose-500">
                    &gt;
                  </span>

                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* RESOURCES */}
          <div>
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-neutral-300">
              Resources
            </h2>

            <nav className="mt-5 flex flex-col gap-3">
              {resourceLinks.map((item) => {
                if (item.external) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex w-fit items-center gap-2 font-mono text-sm text-neutral-500 transition-colors duration-200 hover:text-neutral-100"
                    >
                      <span className="text-neutral-700 transition-colors group-hover:text-rose-500">
                        &gt;
                      </span>

                      {item.label}

                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          d="M7 17L17 7M9 7h8v8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="group inline-flex w-fit items-center gap-2 font-mono text-sm text-neutral-500 transition-colors duration-200 hover:text-neutral-100"
                  >
                    <span className="text-neutral-700 transition-colors group-hover:text-rose-500">
                      &gt;
                    </span>

                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-y border-dashed border-neutral-800 py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs text-neutral-600">
              © {currentYear} Kanban Collab. All rights reserved.
            </p>

            <div className="flex items-center gap-4 font-mono text-xs text-neutral-600">
              <span>
                <span className="text-emerald-500">●</span> online
              </span>

              <span className="text-neutral-800">|</span>

              <span>v0.1.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
