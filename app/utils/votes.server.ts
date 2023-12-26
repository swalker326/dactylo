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
  const existingVote = video.votes.find((vote) => vote.userId === user.id);
  const upvotes = video.votes.filter((vote) => vote.voteType === "UPVOTE");
  const downvotes = video.votes.filter((vote) => vote.voteType === "DOWNVOTE");
  const currentVoteCount = upvotes.length - downvotes.length;
  let response: VoteResponse<ZodError<AddVoteSchema>> = {
    status: "success",
    vote
  };
  let newVoteCount = currentVoteCount + (vote === "UPVOTE" ? 1 : -1);
  //if the user has already voted on this video, and this vote is the same as the existing vote, remove the vote
  //since we're actually removing a vote, UPVOTE === -1 and DOWNVOTE === 1
  if (existingVote && existingVote.voteType === vote) {
    newVoteCount = currentVoteCount - (vote === "UPVOTE" ? 1 : -1);
    await prisma.video.update({
      where: { id: video.id },
      data: {
        voteCount: newVoteCount,
        votes: { delete: { id: existingVote.id } }
      }
    });
    response = { status: "success", vote: null };
  }
  //if the user has already voted on this video, and this vote is different from the existing vote, update the vote
  //since we're switching votes, UPVOTE === 2 and DOWNVOTE === -2
  else if (existingVote && existingVote.voteType !== vote) {
    newVoteCount = currentVoteCount - (vote === "UPVOTE" ? -2 : 2);
    await prisma.video.update({
      where: { id: video.id },
      data: {
        voteCount: newVoteCount,
        votes: {
          update: { where: { id: existingVote.id }, data: { voteType: vote } }
        }
      }
    });
    response = { status: "success", vote };
  } else {
    //if the user has not voted on this video, create a new vote
    //since we're creating a new vote, UPVOTE === 1 and DOWNVOTE === -1
    await prisma.video.update({
      where: { id: video.id },
      data: {
        voteCount: newVoteCount,
        votes: {
          create: {
            userId: user.id,
            voteType: vote
          }
        }
      }
    });
  }
  return response;
};
