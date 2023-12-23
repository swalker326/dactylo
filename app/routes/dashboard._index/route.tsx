import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
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
    <div
      className="w-full bg-cover aspect-square relative"
      style={{ backgroundImage: `url('${video.gifUrl}')` }}
    >
      <Link to={`/sign/${video.sign.id}`}>
        <h3 className="text-3xl">{video.sign.term}</h3>
        {/* <img src={video.gifUrl || ""} alt={video.sign.term} /> */}
      </Link>
    </div>
  );
};
export default function DashboardIndex() {
  const { videos } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col pb-12">
      <h2 className="text-4xl">Your Videos</h2>
      <div className="grid grid-cols-1 lg:grid-cols-4">
        {videos.map((VideoWithSign) =>
          VideoWithSign ? (
            <Thumbnail key={VideoWithSign.id} video={VideoWithSign} />
          ) : null
        )}
      </div>
    </div>
  );
}
