import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { Archive02Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import { cardApi } from "@/features/boards/api/cardApi";
import { boardKeys } from "@/hooks/useBoards";

interface ArchivedCardsDialogProps {
  boardId: string;
  onClose: () => void;
  /**
   * How to restore a card. The board passes the live path when its document is
   * connected (`docApi.updateCard(id, { isArchived: false })`) and the REST
   * mutation otherwise.
   *
   * This matters: the archive itself goes through the document, so a restore
   * that only wrote to Mongo left `isArchived: true` in the CRDT and the next
   * reconcile archived the card again. Defaults to REST so the dialog still
   * works on its own.
   */
  onRestore?: (cardId: string) => void;
}

/**
 * Archived cards, with a way back.
 *
 * Archiving used to be a one-way trip: `PATCH /cards/:id` accepted
 * `isArchived: true`, every listing filtered it out, and nothing could list or
 * restore what it hid. This is the other half.
 */
export function ArchivedCardsDialog({
  boardId,
  onClose,
  onRestore,
}: ArchivedCardsDialogProps) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);

  const archived = useQuery({
    queryKey: [...boardKeys.detail(boardId), "archived"],
    queryFn: () => cardApi.listArchivedCards(boardId),
    staleTime: 10_000,
  });

  const restore = useMutation({
    mutationFn: (cardId: string) => {
      if (onRestore) {
        onRestore(cardId);

        return Promise.resolve();
      }

      return cardApi
        .updateCard(cardId, { isArchived: false })
        .then(() => undefined);
    },
    onSuccess: () => {
      setMessage("Card restored to its column.");
      void queryClient.invalidateQueries({
        queryKey: boardKeys.detail(boardId),
      });
      void queryClient.invalidateQueries({
        queryKey: [...boardKeys.detail(boardId), "archived"],
      });
    },
    onError: () => setMessage("Couldn't restore that card. Please try again."),
  });

  const cards = archived.data ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Archived cards"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-(--hairline) bg-(--bg-root) p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-(--text-primary)">
              <HugeiconsIcon icon={Archive02Icon} size={15} strokeWidth={1.7} />
              Archived cards
            </h2>
            <p className="mt-1 font-mono text-[11px] text-(--text-muted)">
              Restoring a card puts it back in its original column.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 cursor-pointer rounded-lg border border-(--hairline) px-3 font-mono text-[11px] text-(--text-soft) transition-colors hover:bg-(--tint-4) hover:text-(--text-primary)"
          >
            Close
          </button>
        </header>

        {archived.isLoading ? (
          <p className="mt-4 font-mono text-[12px] text-(--text-muted)">
            Loading…
          </p>
        ) : archived.isError ? (
          <p className="mt-4 font-mono text-[12px] text-(--danger)">
            Couldn&apos;t load archived cards.
          </p>
        ) : cards.length === 0 ? (
          <p className="mt-4 font-mono text-[12px] text-(--text-muted)">
            Nothing is archived on this board.
          </p>
        ) : (
          <ul className="mt-4 max-h-80 divide-y divide-(--hairline) overflow-y-auto">
            {cards.map((card) => (
              <li
                key={card.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] text-(--text-primary)">
                    {card.title}
                  </p>
                  <p className="mt-0.5 font-mono text-[10.5px] text-(--text-muted)">
                    {card.columnName ?? "Column removed"} · archived{" "}
                    {new Date(card.archivedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => restore.mutate(card.id)}
                  disabled={restore.isPending}
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-(--hairline-strong) px-2.5 py-1 font-mono text-[10.5px] text-(--text-primary) transition-colors hover:bg-(--tint-4) disabled:opacity-50"
                >
                  <HugeiconsIcon
                    icon={ArrowLeft01Icon}
                    size={12}
                    strokeWidth={1.8}
                  />
                  Restore
                </button>
              </li>
            ))}
          </ul>
        )}

        {message && (
          <p className="mt-3 font-mono text-[11px] text-(--text-secondary)">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
