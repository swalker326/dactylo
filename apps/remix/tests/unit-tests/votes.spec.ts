import { updateVoteCount } from "../../app/utils/votes";
import { describe, test, expect } from "vitest";

describe("updateVoteCount", () => {
  test("should increase count by 1 when current vote is NO_VOTE and new vote is UPVOTE", () => {
    expect(
      updateVoteCount({
        count: 0,
        currentVoteType: "NO_VOTE",
        newVoteType: "UPVOTE"
      })
    ).toBe(1);
  });

  test("should decrease count by 1 when current vote is NO_VOTE and new vote is DOWNVOTE", () => {
    expect(
      updateVoteCount({
        count: 0,
        currentVoteType: "NO_VOTE",
        newVoteType: "DOWNVOTE"
      })
    ).toBe(-1);
  });

  test("should decrease count by 2 when switching from UPVOTE to DOWNVOTE", () => {
    expect(
      updateVoteCount({
        count: 1,
        currentVoteType: "UPVOTE",
        newVoteType: "DOWNVOTE"
      })
    ).toBe(-1);
  });

  test("should increase count by 2 when switching from DOWNVOTE to UPVOTE", () => {
    expect(
      updateVoteCount({
        count: -1,
        newVoteType: "UPVOTE",
        currentVoteType: "DOWNVOTE"
      })
    ).toBe(1);
  });

  test("should decrease count by 1 when retracting an UPVOTE", () => {
    expect(
      updateVoteCount({
        count: 1,
        newVoteType: "NO_VOTE",
        currentVoteType: "UPVOTE"
      })
    ).toBe(0);
  });

  test("should increase count by 1 when retracting a DOWNVOTE", () => {
    expect(
      updateVoteCount({
        count: -1,
        newVoteType: "NO_VOTE",
        currentVoteType: "DOWNVOTE"
      })
    ).toBe(0);
  });

  test("should not change the count when the vote type remains the same (UPVOTE)", () => {
    expect(
      updateVoteCount({
        count: 1,
        newVoteType: "UPVOTE",
        currentVoteType: "UPVOTE"
      })
    ).toBe(1);
  });

  test("should not change the count when the vote type remains the same (DOWNVOTE)", () => {
    expect(
      updateVoteCount({
        count: 0,
        newVoteType: "DOWNVOTE",
        currentVoteType: "DOWNVOTE"
      })
    ).toBe(0);
  });

  // Additional test cases to cover all scenarios
  test("should not change the count when retracting a NO_VOTE", () => {
    expect(
      updateVoteCount({
        count: 1,
        newVoteType: "NO_VOTE",
        currentVoteType: "NO_VOTE"
      })
    ).toBe(1);
  });

  test("should increase count by 1 when switching from NO_VOTE to UPVOTE", () => {
    expect(
      updateVoteCount({
        count: 0,
        newVoteType: "UPVOTE",
        currentVoteType: "NO_VOTE"
      })
    ).toBe(1);
  });

  test("should decrease count by 1 when switching from NO_VOTE to DOWNVOTE", () => {
    expect(
      updateVoteCount({
        count: 0,
        newVoteType: "DOWNVOTE",
        currentVoteType: "NO_VOTE"
      })
    ).toBe(-1);
  });
});
