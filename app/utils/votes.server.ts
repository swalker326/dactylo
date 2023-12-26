import { Prisma, User, VoteType } from "@prisma/client";
import { ZodError, z } from "zod";
import { prisma } from "~/db.server";

const videoWithVotes = Prisma.validator<Prisma.VideoDefaultArgs>()({
  include: { votes: true }
});
export type VideoWithVotes = Prisma.VideoGetPayload<typeof videoWithVotes>;

const AddVoteSchema = z.object({
  user: z.custom<User>((u) => (!u ? "UserId not found" : true)),
  video: z.custom<VideoWithVotes>((v) => (!v ? "Video not found" : true))
});
type AddVoteSchema = z.infer<typeof AddVoteSchema>;

type VoteError<T extends ZodError> = { status: "error"; errors: T };
type VoteSuccess = { status: "success"; vote: VoteType | null };
type VoteResponse<T extends ZodError> = VoteError<T> | VoteSuccess;

export const addVote = async ({
  vote,
  videoId,
  userId
}: {
  vote: VoteType;
  videoId: string | undefined;
  userId: string | undefined;
}): Promise<VoteResponse<ZodError<AddVoteSchema>>> => {
  const dbVideo = await prisma.video.findUnique({
    where: { id: videoId },
    include: { votes: true }
  });
  const dbUser = await prisma.user.findUnique({
    where: { id: userId }
  });
  const payload = AddVoteSchema.safeParse({ user: dbUser, video: dbVideo });
  if (!payload.success) {
    return { status: "error", errors: payload.error };
  }

  const { user, video } = payload.data;
  const existingVote = video.votes.find((v) => v.userId === user.id);

  if (existingVote) {
    if (vote === existingVote.voteType) {
      // Set vote to NO_VOTE
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { voteType: "NO_VOTE" }
      });
    } else {
      // Change vote
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { voteType: vote }
      });
    }
  } else if (vote !== "NO_VOTE") {
    // Create new vote
    await prisma.vote.create({
      data: {
        userId: user.id,
        videoId: video.id,
        voteType: vote
      }
    });
  }
  // Update video vote count
  const votes = await prisma.vote.findMany({
    where: { videoId: video.id }
  });
  const newVoteCount = votes.reduce((acc, vote) => {
    if (vote.voteType === "UPVOTE") {
      return acc + 1;
    } else if (vote.voteType === "DOWNVOTE") {
      return acc - 1;
    }
    return acc;
  }, 0);
  await prisma.video.update({
    where: { id: video.id },
    data: { voteCount: newVoteCount }
  });

  return { status: "success", vote: vote !== "NO_VOTE" ? vote : null };
};
