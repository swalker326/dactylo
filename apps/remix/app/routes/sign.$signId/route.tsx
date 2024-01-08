import { invariant } from "@epic-web/invariant";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  json
} from "@remix-run/node";
import { Link } from "@remix-run/react";
import { z } from "zod";
import { prisma } from "@dactylo/db";
import { parse } from "@conform-to/zod";
import { getUserId, requireUserId } from "~/services/auth.server";
import { addVote } from "~/utils/votes.server";
import { VideoCard } from "~/components/video-card";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { PlusCircleIcon } from "lucide-react";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { signId } = params;
  const userId = await getUserId(request);
  invariant(signId, "sign-id is required");
  const sign = await prisma.sign.findUnique({
    where: { id: signId },
    include: {
      videos: {
        where: { status: "ACTIVE" },
        orderBy: { voteCount: "desc" },
        include: { votes: true, favorites: true }
      }
    }
  });
  invariant(sign, "sign not found");
  return typedjson({ sign, userId });
}
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const term =
    data?.sign?.term?.charAt(0).toLocaleUpperCase() + data.sign.term.slice(1);
  return [{ title: term || "Sign" }];
};

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
  const { sign, userId } = useTypedLoaderData<typeof loader>();
  const { videos } = sign;
  const topVideo = videos[0];

  return (
    <div className="flex flex-col">
      {videos.length === 0 && (
        <div>
          <p>No videos yet </p>
          <p>
            Be the first to
            <Link to="/dashboard/create">Upload one</Link>
          </p>
        </div>
      )}
      {topVideo && (
        <div className="flex flex-col">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{sign.term}</CardTitle>
                <ul className="flex flex-col space-y-2">
                  <li>
                    <span className="font-bold">Definition</span>:{" "}
                    {sign.definition}
                  </li>
                  <li>
                    <span className="font-bold">Example:</span> {sign.example}
                  </li>
                </ul>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative">
                  <VideoCard video={topVideo} userId={userId} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-y-2 px-1.5 md:px-0 py-4">
        <h3 className="text-3xl">More Videos...</h3>
        <Link
          to={`/dashboard/create?signId=${sign.id}`}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md py-1 px-8"
        >
          <div className="flex justify-center items-center w-full h-full py-2 gap-2">
            <p className="text-xl">Add a Video</p>
            <PlusCircleIcon size={22} />
          </div>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {videos
          .slice(1)
          .sort((vA, vB) => (vA.voteCount >= vB.voteCount ? -1 : 1))
          .map((video) => (
            <VideoCard
              key={video.id}
              variant="compact"
              video={video}
              userId={userId}
            />
          ))}
      </div>
    </div>
  );
}
