import { LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { InfoIcon } from "lucide-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "~/components/ui/popover";
import { VideoCard } from "~/components/video-card";
import { prisma } from "~/db.server";
import { requireUserId } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const videos = await prisma.video.findMany({
    where: { user: { id: userId } },
    include: {
      votes: true,
      favorites: true,
      sign: true
    },
    take: 10
  });
  return typedjson({ videos, userId });
}

export default function DashboardIndex() {
  const { videos, userId } = useTypedLoaderData<typeof loader>();

  return (
    <div className="flex flex-col pb-12">
      <h2 className="text-4xl">Your Videos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {videos.map((video) => (
          <div key={video.id} className="p-4 w-full">
            <Link to={`/sign/${video.sign.id}`}>
              <div className="w-full" key={video.id}>
                <div className="bg-white dark:bg-gray-700 dark:text-white rounded-lg overflow-hidden">
                  <div className="flex items-center px-1.5">
                    <h2 className="text-4xl extra-bold py-4 text-center capitalize">
                      {video.sign?.term}
                    </h2>
                    <Popover>
                      <PopoverTrigger asChild>
                        <InfoIcon className="ml-auto" size={24} />
                        {/* <Button variant="outline">Open popover</Button> */}
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        {video.sign?.definition}
                        <h4 className="text-xl py-2 font-bold">Example</h4>
                        {video.sign?.example}
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="bg-white rounded-md">
                    <VideoCard userId={userId || null} video={video} />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
