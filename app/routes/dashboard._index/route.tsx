import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { requireUserId } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const videos = await prisma.video.findMany({
    where: { user: { id: userId } },
    select: { id: true, name: true, url: true, status: true },
    take: 10
  });
  return { videos };
}
export default function DashboardIndex() {
  const { videos } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col">
      <h2 className="text-4xl">_Index</h2>
      {videos.map((video) => (
        <div key={video.id}>
          <p>{video.name}</p>
          <p>{video.url}</p>
          <p>{video.status}</p>
        </div>
      ))}
    </div>
  );
}
