import { type VoteType } from "@dactylo/db/types";

export function updateVoteCount({
	count,
	currentVoteType,
	newVoteType,
}: {
	count: number;
	currentVoteType: VoteType | null;
	newVoteType: VoteType;
}) {
	let newCount = count;

	// If retracting a vote (switching to NO_VOTE)
	if (newVoteType === "NO_VOTE") {
		if (currentVoteType === "UPVOTE") {
			newCount -= 1;
		} else if (currentVoteType === "DOWNVOTE") {
			newCount += 1;
		}
	} else if (currentVoteType === "UPVOTE") {
		if (newVoteType === "DOWNVOTE") {
			newCount -= 2; // Remove UPVOTE and add DOWNVOTE
		}
	} else if (currentVoteType === "DOWNVOTE") {
		if (newVoteType === "UPVOTE") {
			newCount += 2; // Remove DOWNVOTE and add UPVOTE
		}
	} else if (currentVoteType === null || currentVoteType === "NO_VOTE") {
		if (newVoteType === "UPVOTE") {
			newCount += 1;
		} else if (newVoteType === "DOWNVOTE") {
			newCount -= 1;
		}
	}

	return newCount;
}
