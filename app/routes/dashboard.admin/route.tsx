import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { prisma } from "~/db.server";
import { formatDistanceToNow } from "date-fns";
import { requireUserWithRole } from "~/utils/permissions.server";
import { Button } from "~/components/ui/button";
import { invariant } from "@epic-web/invariant";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { videoId, approved, removed } = Object.fromEntries(formData.entries());
  invariant(videoId, "videoId is required");
  if (videoId && removed === "REMOVED") {
    await prisma.video.update({
      where: { id: videoId as string },
      data: { status: "REMOVED" }
    });
  } else if (videoId && approved === "APPROVED") {
    await prisma.video.update({
      where: { id: videoId as string },
      data: { status: "ACTIVE" }
    });
  }
  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserWithRole(request, "admin");
  const videos = await prisma.video.findMany({
    select: {
      id: true,
      signId: true,
      url: true,
      sign: true,
      uploadDate: true,
      user: true
    },
    where: { status: "UNDER_REVIEW" }
  });
  return typedjson({ videos });
}

export default function AdminRoute() {
  let { videos } = useTypedLoaderData<typeof loader>();
  const fetcher = useFetcher();
  if (fetcher.formData?.has("videoId")) {
    videos = videos?.filter(
      (video) => video.id !== fetcher.formData?.get("videoId")
    );
  }

  return (
    <div>
      <div className="space-y-8">
        {videos.length > 0 ? (
          videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-md p-2 flex flex-col md:flex-row gap-3 h-full shadow-md"
            >
              <video
                loop
                muted
                autoPlay
                playsInline
                src={`${video.url}`}
                className="rounded-md order-last md:order-first w-1/2"
              >
                <track kind="captions" />
              </video>
              <div className="w-full">
                <div className="flex flex-col justify-between h-full p-4 rounded-md">
                  <div>
                    <Link
                      to={`/sign/${video.signId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <h4 className="capitalize text-3xl font-bold underline">
                        {video.sign?.term}
                      </h4>
                    </Link>
                    <div className="flex gap-x-2 justify-start items-center">
                      <p className="text-gray-400 font-light">
                        {formatDistanceToNow(video.uploadDate, {
                          addSuffix: true
                        })}
                      </p>
                      <p className="py-1">{video.user.email}</p>
                    </div>
                    <p className="py-1 pt-4">{video.sign?.definition}</p>
                  </div>
                  <fetcher.Form
                    method="POST"
                    action="/dashboard/admin"
                    className="flex justify-end gap-3 "
                  >
                    <input type="hidden" name="videoId" value={video.id} />
                    <Button
                      name="removed"
                      value="REMOVED"
                      variant="outline"
                      className="border border-red-500 text-red-500 hover:bg-red-100 hover:text-red-500"
                    >
                      Deny
                    </Button>
                    <Button value="APPROVED" name="approved">
                      Approve
                    </Button>
                  </fetcher.Form>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center">
            <p className="text-3xl font-bold">No videos to review</p>
            <p className="text-xl">
              <Link to="/dashboard/upload">Upload one</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
