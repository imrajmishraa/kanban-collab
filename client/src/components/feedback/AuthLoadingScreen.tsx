interface AuthLoadingScreenProps {
  message?: string;
}

export default function AuthLoadingScreen({
  message = "Restoring session...",
}: AuthLoadingScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-(--bg-root) text-(--text-primary)">
      <div className="text-center">
        <p className="font-mono text-xs text-(--text-muted)">[ {message} ]</p>

        <span
          aria-hidden="true"
          className="mx-auto mt-4 block h-1.5 w-1.5 animate-pulse bg-(--brand)"
        />
      </div>
    </main>
  );
}
