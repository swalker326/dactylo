import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "~/components/ui/carousel";
import { VideoCard } from "~/components/video-card";
import { prisma } from "~/db.server";
import { getUserId } from "~/services/auth.server";
import { superjson, useSuperLoaderData } from "~/utils/data";

export const meta: MetaFunction = () => {
  return [
    { title: "Dactylo" },
    { name: "description", content: "Learning ASL with others" }
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const maybeUser = await getUserId(request);
  const videos = await prisma.video.findMany({
    where: { status: "ACTIVE" },
    include: { sign: true, votes: true },
    take: 10,
    orderBy: { uploadDate: "desc" }
  });
  return superjson({ videos, userId: maybeUser });
}

export default function Index() {
  const { videos, userId } = useSuperLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <div className="container px-4 flex justify-center max-w-[100%] overflow-hidden">
        <Carousel className="w-[80%]">
          <CarouselContent>
            {videos.map((video) => (
              <CarouselItem key={video.id} className=" sm:basis-1/2 relative">
                <h2 className="text-xl bold">{video.sign?.term}</h2>
                <VideoCard userId={userId || null} video={video} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
}
