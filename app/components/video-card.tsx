import { VoteType, Vote, Favorite } from "@prisma/client";
import { Link, useFetcher } from "@remix-run/react";
import { ThumbsUp, ThumbsDown, Heart } from "lucide-react";
import { useState } from "react";
import { updateVoteCount } from "~/utils/votes";
import { VideoWithVotes } from "~/utils/votes.server";
import ImageWithPlaceholder from "./image-placeholder";

export function VideoCard({
  video,
  userId,
  variant = "default"
}: {
  video: VideoWithVotes;
  userId: string | null;
  variant?: "default" | "compact";
}) {
  const currentVote = video.votes?.find((vote) => vote.userId === userId);
  const favorite = video.favorites?.find(
    (favorite) => favorite.userId === userId
  );

  return (
    <div className={`w-full`}>
      <div className="rounded-lg overflow-hidden">
        <Link to={`/sign/${video.signId}`}>
          <ImageWithPlaceholder
            src={video.gifUrl || ""}
            alt="sign video"
            className="aspect-square w-full object-cover overflow-hidden rounded-t-lg"
          />
        </Link>
        <div className={`w-full bg-white dark:bg-gray-700 rounded-b-lg`}>
          <VoteButtons
            //TODO: there will always be a signId, but it's not typed
            signId={video.signId as string}
            count={video.voteCount}
            videoId={video.id}
            currentVote={currentVote}
            variant={variant}
            userId={userId}
            favorite={favorite}
          />
        </div>
      </div>
    </div>
  );
}

function VoteButtons({
  count,
  videoId,
  currentVote,
  signId,
  variant = "default",
  userId,
  favorite,
  animate = false
}: {
  signId: string;
  count: number;
  videoId: string;
  currentVote: Vote | undefined;
  userId: string | null;
  variant?: "default" | "compact";
  favorite: Favorite | undefined;
  animate?: boolean;
}) {
  const fetcher = useFetcher();
  const favoriteFetcher = useFetcher();
  // const [animating, setAnimating] = useState(false);
  const [intent, setIntent] = useState<VoteType>(
    currentVote?.voteType || "NO_VOTE"
  );
  if (favoriteFetcher.formData?.has("userId")) {
    if (!favorite) {
      animate = true;
      favorite = { id: "1", userId: "1", videoId: videoId };
    } else {
      favorite = undefined;
    }
  }
  // const baseButtonStyle =
  //   "group rounded-xl p-1 h-full md:px-4 transition-colors duration-300 ease-in-out";
  const iconBaseStyle =
    "md:group-hover:-translate-y-1 ease-in-out transition-transform duration-300";
  if (fetcher.formData?.has("intent")) {
    let intent = fetcher.formData.get("intent") as VoteType;
    const originalVoteType = currentVote?.voteType;
    if (intent === originalVoteType) {
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
        voteType: intent === originalVoteType ? "NO_VOTE" : intent
      };
    }
    count = updateVoteCount({
      currentVoteType: originalVoteType || null,
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
    <div
      className={`flex items-center  ${
        variant === "default" ? "justify-between" : "justify-center"
      } h-full w-full`}
    >
      <fetcher.Form
        method="POST"
        action={`/sign/${signId}`}
        className={`flex items-center dark:text-white w-full ${
          variant === "default" ? "justify-between" : "justify-center"
        }}`}
      >
        <input type="hidden" name="videoId" value={videoId} />
        <input type="hidden" name="intent" value={intent} />
        {variant === "default" ? (
          <div className="py-4">
            <div className="flex gap-x-1 rounded-2xl bg-gray-300 dark:bg-gray-800 py-4 px-2 items-center w-full justify-center">
              <button
                value="UPVOTE"
                type="submit"
                onClick={handleUpdateIntent}
                className={`${
                  currentVote?.voteType === "UPVOTE"
                    ? `text-blue-500 dark:text-blue-300`
                    : ""
                } `}
              >
                <span>
                  <ThumbsUp size={24} className={iconBaseStyle} />
                </span>
              </button>
              <span className="text-xl font-bold w-[3ch] text-center">
                {String(count).padStart(2, " ")}
              </span>
              <button
                type="submit"
                value="DOWNVOTE"
                onClick={handleUpdateIntent}
                className={`${
                  currentVote?.voteType === "DOWNVOTE" ? `text-orange-500 ` : ""
                }`}
              >
                <span>
                  <ThumbsDown size={24} className={iconBaseStyle} />
                </span>
              </button>
            </div>
          </div>
        ) : (
          <CompactButtons
            count={count}
            voteType={currentVote?.voteType}
            iconBaseStyle={iconBaseStyle}
            handleUpdateIntent={handleUpdateIntent}
          />
        )}
      </fetcher.Form>
      {variant === "default" && (
        <div>
          <favoriteFetcher.Form method="POST" action="/sign/favorite">
            <input type="hidden" name="videoId" value={videoId} />
            <input type="hidden" name="userId" value={userId || ""} />
            <button
              onAnimationEnd={() => (animate = false)}
              className={`${favorite ? "text-red-500" : ""}  ${
                animate ? "animate-zoomy" : ""
              } `}
            >
              <Heart size={24} />
            </button>
          </favoriteFetcher.Form>
        </div>
      )}
    </div>
  );
}

const CompactButtons = ({
  voteType,
  handleUpdateIntent,
  count,
  iconBaseStyle
}: {
  voteType?: "UPVOTE" | "DOWNVOTE" | "NO_VOTE";
  handleUpdateIntent: (e: React.MouseEvent<HTMLButtonElement>) => void;
  count: number;
  iconBaseStyle: string;
}) => {
  return (
    <div className="flex gap-x-1 bg-gray-300 dark:bg-gray-800 py-4 px-2 items-center w-full justify-center">
      <button
        value="UPVOTE"
        type="submit"
        onClick={handleUpdateIntent}
        className={`${
          voteType === "UPVOTE" ? `text-blue-500 dark:text-blue-300` : ""
        } `}
      >
        <span>
          <ThumbsUp size={24} className={iconBaseStyle} />
        </span>
      </button>
      <span className="text-xl font-bold w-[3ch] text-center">
        {String(count).padStart(2, " ")}
      </span>
      <button
        type="submit"
        value="DOWNVOTE"
        onClick={handleUpdateIntent}
        className={`
          ${voteType === "DOWNVOTE" ? `text-orange-500 ` : ""}
          `}
      >
        <span>
          <ThumbsDown size={24} className={iconBaseStyle} />
        </span>
      </button>
    </div>
  );
};
