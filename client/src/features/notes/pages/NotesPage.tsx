import { useState } from "react";
import type { FormEvent } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notesApi } from "@/api/dashboard/notesApi";
import { useActiveWorkspace } from "@/stores/activeWorkspace";

import type { Note } from "@/types/api/dashboard/note";

const noteKeys = {
  all: ["notes"] as const,
  list: (workspaceId: string) => [...noteKeys.all, workspaceId] as const,
};

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function NotesPage() {
  const { activeWorkspaceId, activeWorkspaceName } = useActiveWorkspace();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const notesQuery = useQuery({
    queryKey: noteKeys.list(activeWorkspaceId ?? ""),
    queryFn: () => notesApi.listNotes(activeWorkspaceId!),
    enabled: Boolean(activeWorkspaceId),
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: noteKeys.all });

  const createNote = useMutation({
    mutationFn: () =>
      notesApi.createNote({
        workspaceId: activeWorkspaceId!,
        title: title.trim(),
        body: body.trim(),
      }),
    onSuccess: () => {
      setTitle("");
      setBody("");
      invalidate();
    },
  });

  const togglePin = useMutation({
    mutationFn: (note: Note) =>
      notesApi.updateNote(note.id, { isPinned: !note.isPinned }),
    onSuccess: invalidate,
  });

  const deleteNote = useMutation({
    mutationFn: (noteId: string) => notesApi.deleteNote(noteId),
    onSuccess: invalidate,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !activeWorkspaceId) return;
    createNote.mutate();
  };

  const notes = notesQuery.data ?? [];

  if (!activeWorkspaceId) {
    return (
      <div className="min-h-screen bg-(--bg-root) px-6 py-10 text-(--text-primary)">
        <p className="font-mono text-[13px] text-(--text-muted)">
          Select a workspace to see its notes.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-root) text-(--text-primary)">
      <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-white/8 pb-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-(--text-muted)">
            {activeWorkspaceName ?? "Workspace"}
          </p>
          <h1 className="mt-1.5 font-mono text-[22px] font-semibold tracking-tight sm:text-[26px]">
            Notes
          </h1>
          <p className="mt-1 max-w-xl font-mono text-[12px] leading-5 text-(--text-secondary)">
            Scratch notes for this workspace. Pin the important ones to the top.
          </p>
        </header>

        {/* Composer */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-xl border border-white/8 bg-white/3 p-4"
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Note title…"
            maxLength={200}
            className="h-10 w-full rounded-lg border border-white/8 bg-white/4 px-3 font-mono text-[13px] text-(--text-primary) outline-none placeholder:text-(--text-muted) focus:border-(--brand-border)"
          />
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write something…"
            rows={3}
            className="mt-2 w-full resize-none rounded-lg border border-white/8 bg-white/4 p-3 font-mono text-[12px] leading-5 text-(--text-primary) outline-none placeholder:text-(--text-muted) focus:border-(--brand-border)"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!title.trim() || createNote.isPending}
              className="h-9 rounded-full border border-(--brand-border) bg-(--brand-muted) px-4 font-mono text-[11px] text-(--brand-hover) transition-colors hover:bg-[rgba(255,107,53,0.18)] hover:text-(--text-primary) disabled:cursor-not-allowed disabled:border-white/8 disabled:bg-transparent disabled:text-(--text-muted)"
            >
              {createNote.isPending ? "Saving…" : "Add note"}
            </button>
          </div>
        </form>

        {/* List */}
        {notesQuery.isLoading ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="h-24 animate-pulse rounded-xl border border-white/8 bg-white/4"
              />
            ))}
          </div>
        ) : notesQuery.isError ? (
          <p className="mt-6 rounded-xl border border-dashed border-white/10 bg-white/2 px-5 py-8 text-center font-mono text-[12px] text-(--text-muted)">
            Couldn't load notes. Please try again.
          </p>
        ) : notes.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-white/10 bg-white/2 px-5 py-10 text-center font-mono text-[12px] text-(--text-muted)">
            No notes yet. Add your first one above.
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {notes.map((note) => (
              <article
                key={note.id}
                className="relative rounded-xl border border-white/8 bg-white/3 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 font-mono text-[13px] font-semibold text-(--text-primary)">
                    {note.title}
                  </h2>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => togglePin.mutate(note)}
                      className={[
                        "rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors",
                        note.isPinned
                          ? "border-(--brand-border) bg-(--brand-muted) text-(--brand-hover)"
                          : "border-white/10 text-(--text-muted) hover:text-(--text-primary)",
                      ].join(" ")}
                    >
                      {note.isPinned ? "Pinned" : "Pin"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteNote.mutate(note.id)}
                      className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-(--danger) transition-colors hover:bg-white/6"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {note.body && (
                  <p className="mt-2 whitespace-pre-wrap font-mono text-[12px] leading-5 text-(--text-secondary)">
                    {note.body}
                  </p>
                )}

                <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-(--text-muted)">
                  Updated {formatRelative(note.updatedAt)}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
