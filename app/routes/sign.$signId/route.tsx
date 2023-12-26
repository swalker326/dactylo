import { invariant } from "@epic-web/invariant";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { z } from "zod";
import { prisma } from "~/db.server";
import { parse } from "@conform-to/zod";
import { getUserId, requireUserId } from "~/services/auth.server";
import { VideoWithVotes, addVote } from "~/utils/votes.server";
import { Vote, VoteType } from "@prisma/client";
import { superjson, useSuperLoaderData } from "~/utils/data";
import { updateVoteCount } from "~/utils/votes";
import { useState } from "react";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { signId } = params;
  const userId = await getUserId(request);
  invariant(signId, "sign-id is required");
  const sign = await prisma.sign.findUnique({
    where: { id: signId },
    include: {
      videos: {
        where: { status: "ACTIVE" },
        orderBy: { voteCount: "asc" },
        include: { votes: true }
      }
    }
  });
  invariant(sign, "sign not found");
  return superjson({ sign, userId });
}

const SignActionSchema = z.object({
  intent: z.enum(["UPVOTE", "DOWNVOTE", "NO_VOTE"]),
  videoId: z.string()
});

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const submission = parse(formData, { schema: SignActionSchema });
  if (submission.intent !== "submit" || !submission.value) {
    return json({ status: "error", error: submission }, { status: 400 });
  }
  const { videoId, intent } = submission.value;
  const response = await addVote({
    userId,
    videoId: videoId,
    vote: intent
  });
  return json(response, { status: 200 });
}

export default function SignIdRoute() {
  const { sign, userId } = useSuperLoaderData<typeof loader>();
  const { videos } = sign;
  const topVideo = videos[0];

  return (
    <div className="flex flex-col">
      <h2 className="text-4xl">
        {sign.term.charAt(0).toLocaleUpperCase() + sign.term.slice(1)}
      </h2>
      {videos.length === 0 && (
        <div>
          <p>No videos yet </p>
          <p>
            Be the first to
            <Link to="/dashboard/upload">Upload one</Link>
          </p>
        </div>
      )}
      {topVideo && (
        <div className="relative">
          <VideoCard video={topVideo} userId={userId} />
        </div>
      )}
    </div>
  );
}

function VideoCard({
  video,
  userId
}: {
  video: VideoWithVotes;
  userId: string | null;
}) {
  const currentVote = video.votes?.find((vote) => vote.userId === userId);

  return (
    <div>
      <img
        src={video.gifUrl || ""}
        alt="sign video"
        className="w-full object-fill"
      />
      <div className="border border-red-500">
        <VoteButtons
          count={video.voteCount}
          videoId={video.id}
          currentVote={currentVote}
        />
      </div>
    </div>
  );
}

function VoteButtons({
  count,
  videoId,
  currentVote
}: {
  count: number;
  videoId: string;
  currentVote: Vote | undefined;
}) {
  const fetcher = useFetcher();
  const [intent, setIntent] = useState<VoteType>(
    currentVote?.voteType || "NO_VOTE"
  );
  if (fetcher.formData?.has("intent")) {
    let intent = fetcher.formData.get("intent") as VoteType;
    const origianlVoteType = currentVote?.voteType;
    if (intent === origianlVoteType) {
      intent = "NO_VOTE";
    }
    if (!currentVote) {
      currentVote = {
        id: "1",
        userId: "1",
        videoId: videoId,
        voteDate: new Date(),
        voteType: intent
      };
    } else if (currentVote.voteType === intent) {
      currentVote = undefined;
    } else {
      currentVote = {
        ...currentVote,
        voteType: intent === origianlVoteType ? "NO_VOTE" : intent
      };
    }
    count = updateVoteCount({
      currentVoteType: origianlVoteType || null,
      count,
      newVoteType: intent
    });
  }
  const handleUpdateIntent = (e: React.MouseEvent<HTMLButtonElement>) => {
    const intent = e.currentTarget.value as VoteType;
    if (intent === currentVote?.voteType) {
      setIntent("NO_VOTE");
    } else {
      setIntent(intent);
    }
  };

  return (
    <fetcher.Form
      method="POST"
      className="h-full flex flex-col justify-center items-center"
    >
      <input type="hidden" name="videoId" value={videoId} />
      <input type="hidden" name="intent" value={intent} />
      <button
        value="UPVOTE"
        type="submit"
        onClick={handleUpdateIntent}
        className={`group text-black hover:text-white px-6 h-full hover:bg-blue-600 transition-colors duration-300 ease-in-out ${
          currentVote?.voteType === "UPVOTE" ? `bg-blue-300` : ""
        } `}
      >
        <span>
          <ChevronUp
            size={32}
            className={`group-hover:-translate-y-1 ease-in-out transition-transform duration-300 `}
          />
        </span>
      </button>
      {count}
      <button
        type="submit"
        value="DOWNVOTE"
        onClick={handleUpdateIntent}
        className={`group text-black hover:text-white px-6 h-full hover:bg-orange-600 transition-colors duration-300 ease-in-out  ${
          currentVote?.voteType === "DOWNVOTE" ? `bg-orange-300` : ""
        } `}
      >
        <span>
          <ChevronDown
            size={32}
            className={`group-hover:translate-y-1 ease-in-out transition-transform duration-300 `}
          />
        </span>
      </button>
    </fetcher.Form>
  );
}
