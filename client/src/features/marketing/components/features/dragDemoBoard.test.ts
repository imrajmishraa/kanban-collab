import { describe, expect, it } from "vitest";

import {
  countIn,
  liftOut,
  MOVING,
  place,
  poster,
  reserve,
  SLOT,
  START,
} from "./dragDemoBoard";

describe("liftOut", () => {
  it("takes the moving card out of its column", () => {
    const next = liftOut(START, "review");
    expect(next.review.map((card) => card.id)).toEqual(["replay", "covers"]);
  });

  it("leaves every other column alone", () => {
    const next = liftOut(START, "review");
    expect(next.done).toEqual(START.done);
    expect(next.backlog).toEqual(START.backlog);
  });

  it("does not mutate the board it was given", () => {
    liftOut(START, "review");
    expect(START.review).toHaveLength(3);
  });
});

describe("reserve", () => {
  it("opens a slot at the top of the target column", () => {
    const next = reserve(START, "done");
    expect(next.done[0].id).toBe(SLOT);
    expect(next.done).toHaveLength(START.done.length + 1);
  });

  it("is not counted as a card", () => {
    const next = reserve(START, "done");
    expect(countIn(next, "done")).toBe(countIn(START, "done"));
  });
});

describe("place", () => {
  it("puts the moving card where the slot was", () => {
    const next = place(reserve(liftOut(START, "review"), "done"), "done");
    expect(next.done[0].id).toBe(MOVING);
    expect(next.done.some((card) => card.id === SLOT)).toBe(false);
    expect(countIn(next, "done")).toBe(countIn(START, "done") + 1);
    expect(countIn(next, "review")).toBe(countIn(START, "review") - 1);
  });
});

describe("the loop", () => {
  it("returns to the start board after a round trip", () => {
    const there = place(reserve(liftOut(START, "review"), "done"), "done");
    const back = place(reserve(liftOut(there, "done"), "review"), "review");
    expect(back.review.map((card) => card.id)).toEqual(
      START.review.map((card) => card.id),
    );
    expect(countIn(back, "done")).toBe(countIn(START, "done"));
  });

  it("keeps the poster a real frame: the card landed, nothing left open", () => {
    const still = poster();
    expect(still.done[0].id).toBe(MOVING);
    expect(still.done.some((card) => card.id === SLOT)).toBe(false);
    expect(still.review.some((card) => card.id === MOVING)).toBe(false);
  });
});
