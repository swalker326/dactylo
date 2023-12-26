import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { prisma } from "~/db.server";
import { requireUserId } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const videos = await prisma.video.findMany({
    where: { user: { id: userId } },
    select: {
      id: true,
      name: true,
      url: true,
      status: true,
      sign: true,
      gifUrl: true
    },
    take: 10
  });
  return { videos };
}

type LoaderData = Awaited<ReturnType<typeof loader>>;

const Thumbnail = ({ video }: { video: LoaderData["videos"][number] }) => {
  if (!video || !video.sign) return null;
  return (
    <Card>
      <div className="w-full">
        <CardHeader>
          <Link to={`/sign/${video.sign.id}`}>
            <CardTitle className="underline">{video.sign.term}</CardTitle>
          </Link>
        </CardHeader>
        <CardContent>
          <Link to={`/sign/${video.sign.id}`}>
            <img
              src={video.gifUrl || ""}
              alt="sign video"
              className="w-full object-contain"
            />
          </Link>
        </CardContent>
      </div>
    </Card>
  );
};
export default function DashboardIndex() {
  const { videos } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col pb-12">
      <h2 className="text-4xl">Your Videos</h2>
      <div className="flex gap-3 flex-wrap">
        {videos.map((VideoWithSign) =>
          VideoWithSign ? (
            <Thumbnail key={VideoWithSign.id} video={VideoWithSign} />
          ) : null
        )}
      </div>
    </div>
  );
}
