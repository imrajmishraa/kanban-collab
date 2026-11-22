// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import BoardCardItem from "./BoardCardItem";
import type { BoardCard } from "@/types/board";

/*
 * jsdom has no matchMedia, and `ToolTip` reads it at module scope — so the stub
 * has to be in place before the import below runs, which is what `vi.hoisted`
 * is for. (Worth fixing at the source: a module-scope `window.matchMedia` call
 * throws in any environment without it.)
 */
vi.hoisted(() => {
  if (typeof window !== "undefined" && !window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }
});

/**
 * The keyboard path for a card.
 *
 * Dragging never fires from a finger and has no keyboard equivalent, so this is
 * the only way a card changes column without a mouse. Pinned here because it is
 * a keydown handler on a non-form element — nothing else would notice if it
 * stopped being wired.
 */

const card: BoardCard = {
  id: "card-1",
  boardId: "board-1",
  workspaceId: "ws-1",
  columnId: "col-1",
  title: "Write the spec",
  description: "",
  dueDate: undefined,
  members: [],
  labels: [],
  checklists: [],
  orderIndex: 0,
  isArchived: false,
  createdAt: "2026-11-22T00:00:00.000Z",
  updatedAt: "2026-11-22T00:00:00.000Z",
} satisfies BoardCard;

function renderCard(
  overrides: Partial<Parameters<typeof BoardCardItem>[0]> = {},
) {
  const props = {
    card,
    draggable: true,
    isDragging: false,
    onOpen: vi.fn(),
    onDragStart: vi.fn(),
    onDragEnd: vi.fn(),
    onDragOverCard: vi.fn(),
    onKeyboardMove: vi.fn(),
    ...overrides,
  };

  render(<BoardCardItem {...props} />);

  return props;
}

afterEach(cleanup);

describe("BoardCardItem keyboard", () => {
  it("moves the card left and right with Alt+Arrow", async () => {
    const user = userEvent.setup();
    const props = renderCard();

    const item = screen.getByRole("button", { name: /Write the spec/ });
    item.focus();

    await user.keyboard("{Alt>}{ArrowLeft}{/Alt}");
    expect(props.onKeyboardMove).toHaveBeenLastCalledWith(card, "left");

    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
    expect(props.onKeyboardMove).toHaveBeenLastCalledWith(card, "right");
  });

  it("opens the card on Enter and on Space", async () => {
    const user = userEvent.setup();
    const props = renderCard();

    const item = screen.getByRole("button", { name: /Write the spec/ });
    item.focus();

    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(props.onOpen).toHaveBeenCalledTimes(2);
    /* Opening is not moving. */
    expect(props.onKeyboardMove).not.toHaveBeenCalled();
  });

  it("moves with Shift+Arrow too — the chord no browser or OS owns", async () => {
    const user = userEvent.setup();
    const props = renderCard();

    const item = screen.getByRole("button", { name: /Write the spec/ });
    item.focus();

    await user.keyboard("{Shift>}{ArrowRight}{/Shift}");

    expect(props.onKeyboardMove).toHaveBeenLastCalledWith(card, "right");
  });

  it("ignores Command+Option+Arrow, which is previous/next tab on macOS", async () => {
    const user = userEvent.setup();
    const props = renderCard();

    const item = screen.getByRole("button", { name: /Write the spec/ });
    item.focus();

    /* Moving the card *and* switching tabs is worse than not moving it. */
    await user.keyboard("{Meta>}{Alt>}{ArrowLeft}{/Alt}{/Meta}");
    await user.keyboard("{Control>}{Alt>}{ArrowRight}{/Alt}{/Control}");

    expect(props.onKeyboardMove).not.toHaveBeenCalled();
  });

  it("ignores a plain arrow, which belongs to scrolling", async () => {
    const user = userEvent.setup();
    const props = renderCard();

    const item = screen.getByRole("button", { name: /Write the spec/ });
    item.focus();

    await user.keyboard("{ArrowRight}");

    expect(props.onKeyboardMove).not.toHaveBeenCalled();
  });

  it("does nothing when the board passes no move handler", async () => {
    const user = userEvent.setup();
    const props = renderCard({ onKeyboardMove: undefined });

    const item = screen.getByRole("button", { name: /Write the spec/ });
    item.focus();

    await user.keyboard("{Alt>}{ArrowLeft}{/Alt}");

    expect(props.onOpen).not.toHaveBeenCalled();
  });

  it("is reachable by keyboard at all", () => {
    renderCard();

    expect(
      screen.getByRole("button", { name: /Write the spec/ }),
    ).toHaveProperty("tabIndex", 0);
  });
});
