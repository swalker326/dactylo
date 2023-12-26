import { invariant } from "@epic-web/invariant";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, Link, useSubmit } from "@remix-run/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { z } from "zod";
import { prisma } from "~/db.server";
import { parse } from "@conform-to/zod";
import { getUserId, requireUserId } from "~/services/auth.server";
import { VideoWithVotes, addVote } from "~/utils/votes.server";
import { Vote, VoteType } from "@prisma/client";
import { superjson, useSuperLoaderData } from "~/utils/data";
import { Dispatch, SetStateAction, useState } from "react";
import { updateVoteCount } from "~/utils/votes";

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
  intent: z.enum(["UPVOTE", "DOWNVOTE"]),
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
  const [currentVote, setCurrentVote] = useState<Vote | undefined>(
    video.votes?.find((vote) => vote.userId === userId)
  );
  console.log("current vote count in route: ", video.voteCount);
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
          setCurrentVote={setCurrentVote}
        />
      </div>
    </div>
  );
}

function VoteButtons({
  count,
  videoId,
  currentVote,
  setCurrentVote
}: {
  count: number;
  videoId: string;
  currentVote: Vote | undefined;
  setCurrentVote: Dispatch<SetStateAction<Vote | undefined>>;
}) {
  const [intent, setIntent] = useState<VoteType>();
  const [optCount, setOptCount] = useState<number>(count);
  const submit = useSubmit();
  return (
    <Form
      method="POST"
      className="h-full flex flex-col justify-center items-center"
      onSubmit={(e) => {
        e.preventDefault();

        e.currentTarget;
        const fd = new FormData(e.currentTarget);
        fd.set("intent", intent as VoteType);
        setOptCount(() => {
          return updateVoteCount(
            count,
            currentVote?.voteType || null,
            intent as VoteType
          );
        });
        setCurrentVote((currentVote) => {
          if (currentVote?.voteType === fd.get("intent")) {
            return undefined;
          }
          return {
            ...currentVote,
            id: "1",
            userId: "1",
            videoId: videoId,
            voteDate: new Date(),
            voteType: fd.get("intent") as VoteType
          };
        });
        submit(fd, {
          method: "POST",
          navigate: false,
          unstable_flushSync: true
        });
      }}
    >
      <input type="hidden" name="videoId" value={videoId} />
      <button
        name="intent"
        value="UPVOTE"
        onClick={() => setIntent("UPVOTE")}
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
      {optCount}
      <button
        type="submit"
        name="intent"
        value="DOWNVOTE"
        onClick={() => setIntent("DOWNVOTE")}
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
    </Form>
  );
}
