import "./loader.css";

interface AuthLoadingScreenProps {
  message?: string;
}


export default function LoadingScreen({
  message = "Restoring session",
}: AuthLoadingScreenProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050506] text-(--text-primary)">

      {/* Single soft top bloom — matches the forget-password panel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-96 w-2xl -translate-x-1/2 rounded-[50%] bg-(--brand)/4.5 blur-[150px]"
      />

      {/* Loader */}
      <div className="loader-in relative z-10 flex flex-col items-center">
        {/* Three columns */}
        <div className="flex items-end gap-2.5" aria-hidden="true">
          <LoaderColumn animClass="loader-col-1" />
          <LoaderColumn animClass="loader-col-2" />
          <LoaderColumn animClass="loader-col-3" />
        </div>

        {/* Message */}
        <p className="loader-msg mt-9 font-mono text-[10.5px] uppercase tracking-[0.28em] text-white/40">
          {message}
        </p>
      </div>
    </main>
  );
}

/* LOADER COLUMN */

function LoaderColumn({ animClass }: { animClass: string }) {
  return (
    <div className="relative h-10 w-1.5 overflow-hidden rounded-full bg-white/6">
      <div
        className={`absolute inset-0 origin-bottom rounded-full bg-(--brand) ${animClass}`}
      />
    </div>
  );
}
