import { useRef } from "react";

import {
  useCardAttachments,
  useDeleteAttachment,
  useUploadAttachment,
} from "@/hooks/dashboard/useCardAttachments";

interface CardAttachmentsProps {
  cardId: string;
}

/** Human-readable file size. */
function formatSize(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Card attachments (T15). Files upload straight to ImageKit; this component
 * only lists and records them.
 */
export default function CardAttachments({ cardId }: CardAttachmentsProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const attachments = useCardAttachments(cardId);
  const upload = useUploadAttachment(cardId);
  const remove = useDeleteAttachment(cardId);

  const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so picking the same file twice still fires onChange.
    event.target.value = "";
    if (file) upload.mutate(file);
  };

  return (
    <section className="mt-5 border-t border-white/8 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-(--text-muted)">
          Attachments{attachments.data ? ` (${attachments.data.length})` : ""}
        </h3>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
          className="rounded-lg border border-white/8 bg-white/4 px-2.5 py-1 font-mono text-[10px] text-(--text-secondary) transition-colors hover:text-(--text-primary) disabled:opacity-40"
        >
          {upload.isPending ? "Uploading…" : "Add file"}
        </button>

        <input
          ref={inputRef}
          type="file"
          onChange={handlePick}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {upload.isError && (
        <p className="mt-2 font-mono text-[10px] text-(--danger)">
          Upload failed. Check that ImageKit is configured on the server.
        </p>
      )}

      <div className="mt-3 space-y-2">
        {attachments.isLoading && (
          <p className="font-mono text-[11px] text-(--text-muted)">
            Loading attachments…
          </p>
        )}

        {attachments.isError && (
          <p className="font-mono text-[11px] text-(--danger)">
            Couldn&apos;t load attachments.
          </p>
        )}

        {attachments.data?.length === 0 && (
          <p className="font-mono text-[11px] text-(--text-muted)">
            No files attached.
          </p>
        )}

        {attachments.data?.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/3 px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <a
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="block truncate font-mono text-[11px] text-(--text-primary) hover:underline"
              >
                {attachment.name}
              </a>
              <p className="font-mono text-[10px] text-(--text-muted)">
                {formatSize(attachment.size)} · {attachment.fileType}
              </p>
            </div>

            <button
              type="button"
              onClick={() => remove.mutate(attachment.id)}
              disabled={remove.isPending}
              className="shrink-0 font-mono text-[10px] text-(--text-muted) transition-colors hover:text-(--danger) disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
