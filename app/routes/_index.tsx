import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form, useSearchParams, useSubmit } from "@remix-run/react";
import { Input } from "~/components/ui/input";
import { VideoCard } from "~/components/video-card";
import { prisma } from "~/db.server";
import { useDebounce } from "~/hooks/useDebounce";
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
  const searchTerm = new URL(request.url).searchParams.get("search");
  if (searchTerm) {
    const videos = await prisma.video.findMany({
      where: {
        status: "ACTIVE",
        sign: { term: { contains: searchTerm } }
      },
      include: { sign: true, votes: true },
      take: 10,
      orderBy: { uploadDate: "desc" }
    });
    return superjson({ videos, userId: maybeUser });
  }
  const videos = await prisma.video.findMany({
    where: { status: "ACTIVE" },
    include: { sign: true, votes: true },
    take: 10,
    orderBy: { uploadDate: "desc" }
  });
  return superjson({ videos, userId: maybeUser });
}

export default function Index() {
  const [searchParams] = useSearchParams();
  const submit = useSubmit();
  const { videos, userId } = useSuperLoaderData<typeof loader>();
  const handleFormChange = useDebounce((form: HTMLFormElement) => {
    submit(form, { replace: true });
  }, 500);
  return (
    <div className="flex flex-col gap-4 pt-4">
      <Form method="GET" onChange={(e) => handleFormChange(e.currentTarget)}>
        <Input
          name="search"
          defaultValue={searchParams.get("search") || ""}
          className="h-16 text-2xl md:h-20 md:text-2xl"
          placeholder="Find a Sign..."
        />
      </Form>
      {videos.map((video) => (
        <div
          key={video.id}
          className="bg-white dark:bg-gray-700 dark:text-white rounded-lg "
        >
          <h2 className="text-6xl extra-bold py-4 text-center capitalize">
            {video.sign?.term}
          </h2>
          <div className="bg-white px-4 rounded-md">
            <VideoCard userId={userId || null} video={video} />
          </div>
        </div>
      ))}
    </div>
  );
}
