import { Link, useParams } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Globe02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

import { useCallback, useMemo } from "react";

import { boardApi } from "@/features/boards";
import { readBoard } from "@/services/collaboration/boardDoc";
import {
  buildCollaborationWsUrl,
  useCollaboration,
} from "@/services/collaboration";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * A board somebody shared with a public link.
 *
 * Rendered without a session — this is the client half of
 * `GET /boards/:boardId/public`. Read-only by construction: there is no drag
 * handler, no composer, no edit affordance, because a non-member has no write
 * path at all.
 */
interface ViewCard {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  labels: string[];
  checklistCount: number;
}

interface ViewColumn {
  id: string;
  name: string;
  cards: ViewCard[];
}

export default function SharedBoardPage() {
  const { boardId } = useParams<{ boardId: string }>();

  const shared = useQuery({
    queryKey: ["shared-board", boardId],
    queryFn: () => boardApi.getSharedBoard(boardId as string),
    enabled: Boolean(boardId),
    retry: false,
    staleTime: 30_000,
  });

  /*
   * A signed-in reader also gets the live channel. The server allows a
   * non-member onto a `public` board read-only (`authorize`), so this is the
   * same socket the members use, with writes dropped upstream.
   *
   * An anonymous visitor stays on the HTTP snapshot: the socket's presence list
   * is keyed by user id, and inventing one would put fictional people in front
   * of real ones.
   */
  const currentUser = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const wsUrl = useMemo(() => buildCollaborationWsUrl(boardId), [boardId]);
  const getToken = useCallback(() => useAuthStore.getState().accessToken, []);

  const collabUser = useMemo(() => {
    if (!currentUser) return null;

    return {
      userId: currentUser.id,
      name: currentUser.fullName,
      color: "var(--auth)",
    };
  }, [currentUser]);

  const { doc, synced } = useCollaboration({
    room: boardId ?? null,
    wsUrl,
    getToken,
    user: collabUser,
    enabled: Boolean(accessToken),
  });

  /* The CRDT is authoritative once it holds the board; the REST snapshot is the
     first paint and the fallback for an anonymous reader. */
  const liveBoard = doc ? readBoard(doc) : null;

  if (!boardId) {
    return <Message title="Board not found" />;
  }

  if (shared.isLoading) {
    return <Message title="Loading board…" />;
  }

  /* The endpoint answers 404 for anything not public, so there is no separate
     "not allowed" case to render — and saying which one it is would confirm
     that a private board with this id exists. */
  if (shared.isError || !shared.data) {
    return (
      <Message
        title="This board isn't shared publicly"
        detail="The link may be wrong, or the owner may have stopped sharing it."
      />
    );
  }

  /* Two sources, one shape. The CRDT carries the full `BoardDetails`; the REST
     endpoint carries a smaller public projection. Normalising here keeps the
     render below ignorant of which one answered. */
  const snapshot = shared.data;
  const board = liveBoard
    ? {
        name: liveBoard.name,
        description: liveBoard.description ?? "",
        workspaceName: snapshot.board.workspaceName,
      }
    : snapshot.board;

  const columns: ViewColumn[] = liveBoard
    ? liveBoard.columns.map((column) => ({
        id: column.id,
        name: column.name,
        cards: column.cards.map((card) => ({
          id: card.id,
          title: card.title,
          description: card.description,
          dueDate: card.dueDate ?? null,
          labels: card.labels,
          checklistCount: card.checklists.length,
        })),
      }))
    : snapshot.columns;

  const isLive = Boolean(liveBoard) && synced;

  return (
    <div className="min-h-screen bg-(--bg-root) px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 border-b border-(--hairline) pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-(--text-muted)">
              <HugeiconsIcon icon={Globe02Icon} size={12} strokeWidth={1.7} />
              Public board
              {isLive && (
                <span
                  title="Connected — changes appear as they happen"
                  className="ml-1 inline-flex items-center gap-1 rounded-full border border-(--hairline) px-1.5 py-0.5 text-[9.5px] text-(--success)"
                >
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-(--success)"
                  />
                  Live
                </span>
              )}
            </p>
            <h1 className="mt-2 truncate text-[22px] font-semibold text-(--text-primary)">
              {board.name}
            </h1>
            {board.description && (
              <p className="mt-1 max-w-xl text-[12.5px] text-(--text-soft)">
                {board.description}
              </p>
            )}
            {board.workspaceName && (
              <p className="mt-1 font-mono text-[11px] text-(--text-muted)">
                {board.workspaceName}
              </p>
            )}
          </div>

          <Link
            to="/login"
            className="shrink-0 rounded-none rounded-tl-lg rounded-br-lg bg-(--solid-bg) px-4 py-2 text-[12px] font-semibold text-(--solid-text) transition-colors hover:bg-(--solid-bg-hover)"
          >
            Sign in to collaborate
          </Link>
        </header>

        {columns.length === 0 ? (
          <p className="mt-8 font-mono text-[12px] text-(--text-muted)">
            This board has no columns yet.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {columns.map((column) => (
              <section
                key={column.id}
                className="rounded-xl border border-(--hairline) bg-(--bg-surface)"
              >
                <header className="flex items-center justify-between border-b border-(--hairline) px-3 py-2">
                  <h2 className="truncate text-[12px] font-semibold text-(--text-primary)">
                    {column.name}
                  </h2>
                  <span className="font-mono text-[10.5px] text-(--text-muted)">
                    {column.cards.length}
                  </span>
                </header>

                <ul className="flex flex-col gap-2 p-2">
                  {column.cards.length === 0 ? (
                    <li className="px-1 py-2 font-mono text-[11px] text-(--text-muted)">
                      Empty
                    </li>
                  ) : (
                    column.cards.map((card) => (
                      <li
                        key={card.id}
                        className="rounded-lg border border-(--hairline) bg-(--bg-root) p-2.5"
                      >
                        <p className="text-[12.5px] text-(--text-primary)">
                          {card.title}
                        </p>
                        {card.description && (
                          <p className="mt-1 line-clamp-2 text-[11.5px] text-(--text-muted)">
                            {card.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {card.dueDate && (
                            <span className="flex items-center gap-1 font-mono text-[10px] text-(--text-muted)">
                              <HugeiconsIcon
                                icon={Calendar03Icon}
                                size={10}
                                strokeWidth={1.7}
                              />
                              {new Date(card.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {card.labels.map((label) => (
                            <span
                              key={label}
                              className="rounded border border-(--hairline) px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-(--text-muted)"
                            >
                              {label}
                            </span>
                          ))}
                          {card.checklistCount > 0 && (
                            <span className="flex items-center gap-1 font-mono text-[10px] text-(--text-muted)">
                              <HugeiconsIcon
                                icon={Tick02Icon}
                                size={10}
                                strokeWidth={1.7}
                              />
                              {card.checklistCount}
                            </span>
                          )}
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </section>
            ))}
          </div>
        )}

        <footer className="mt-10 border-t border-(--hairline) pt-4">
          <p className="font-mono text-[10.5px] text-(--text-muted)">
            Read-only view. Anyone with this link can see it.
          </p>
        </footer>
      </div>
    </div>
  );
}

function Message({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-(--bg-root) px-6 text-center">
      <p className="text-[15px] font-semibold text-(--text-primary)">{title}</p>
      {detail && (
        <p className="max-w-sm font-mono text-[11.5px] text-(--text-muted)">
          {detail}
        </p>
      )}
      <Link
        to="/home"
        className="mt-3 rounded-lg border border-(--hairline-strong) px-3 py-1.5 font-mono text-[11px] text-(--text-soft) transition-colors hover:bg-(--tint-4) hover:text-(--text-primary)"
      >
        Go to kanban-collab
      </Link>
    </div>
  );
}
