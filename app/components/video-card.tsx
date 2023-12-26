import { VoteType, Vote } from "@prisma/client";
import { Link, useFetcher } from "@remix-run/react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { updateVoteCount } from "~/utils/votes";
import { VideoWithVotes } from "~/utils/votes.server";

export function VideoCard({
  video,
  userId
}: {
  video: VideoWithVotes;
  userId: string | null;
}) {
  const currentVote = video.votes?.find((vote) => vote.userId === userId);

  return (
    <div>
      <Link to={`/sign/${video.signId}`}>
        <img
          src={video.gifUrl || ""}
          alt="sign video"
          className="w-full object-contain"
        />
      </Link>
      <div className="w-full py-3 bg-gray-700">
        <VoteButtons
          //TODO: there will always be a signId, but it's not typed
          signId={video.signId as string}
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
  currentVote,
  signId
}: {
  signId: string;
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
      action={`/sign/${signId}`}
      className="h-full flex  justify-between items-center text-white px-1 md:px-6"
    >
      <input type="hidden" name="videoId" value={videoId} />
      <input type="hidden" name="intent" value={intent} />
      <button
        value="UPVOTE"
        type="submit"
        onClick={handleUpdateIntent}
        className={`group rounded-xl text-white md:hover:text-white h-full md:px-4 md:hover:bg-blue-600 transition-colors duration-300 ease-in-out ${
          currentVote?.voteType === "UPVOTE" ? `bg-blue-300 text-black` : ""
        } `}
      >
        <span>
          <ChevronUp
            size={32}
            className={`md:group-hover:-translate-y-1 ease-in-out transition-transform duration-300 `}
          />
        </span>
      </button>
      {count}
      <button
        type="submit"
        value="DOWNVOTE"
        onClick={handleUpdateIntent}
        className={` rounded-xl group  text-white md:hover:text-white md:px-4 h-full md:hover:bg-orange-600 transition-colors duration-300 ease-in-out  ${
          currentVote?.voteType === "DOWNVOTE" ? `bg-orange-300 text-black` : ""
        } `}
      >
        <span>
          <ChevronDown
            size={32}
            className={`md:group-hover:translate-y-1 ease-in-out transition-transform duration-300 `}
          />
        </span>
      </button>
    </fetcher.Form>
  );
}
