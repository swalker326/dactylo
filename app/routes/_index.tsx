import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import {
  Form,
  useNavigation,
  useSearchParams,
  useSubmit
} from "@remix-run/react";
import Spinner from "~/icons/spinner.svg?react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Input } from "~/components/ui/input";
import { VideoCard } from "~/components/video-card";
import { prisma } from "~/db.server";
import { useDebounce } from "~/hooks/useDebounce";
import { getUserId } from "~/services/auth.server";

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
      include: { sign: true, votes: true, favorites: true },
      take: 10,
      orderBy: { uploadDate: "desc" }
    });
    return typedjson({ videos, userId: maybeUser });
  }
  const videos = await prisma.video.findMany({
    where: { status: "ACTIVE" },
    include: { sign: true, votes: true, favorites: true },
    take: 10,
    orderBy: { uploadDate: "desc" }
  });
  return typedjson({ videos, userId: maybeUser });
}

export default function Index() {
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const submit = useSubmit();
  const { videos, userId } = useTypedLoaderData<typeof loader>();
  const handleFormChange = useDebounce((form: HTMLFormElement) => {
    submit(form);
  }, 500);
  return (
    <div className="flex flex-col gap-4 pt-4">
      <Form
        method="GET"
        onChange={(e) => handleFormChange(e.currentTarget)}
        className="relative"
      >
        <Input
          name="search"
          defaultValue={searchParams.get("search") || ""}
          className="h-16 text-2xl md:h-20 md:text-2xl"
          placeholder="Find a Sign..."
        />
        {navigation.state !== "idle" && (
          <div className="absolute top-1/2 right-2 -translate-y-1/2">
            <Spinner className=" animate-spin  -ml-1 mr-3 h-6 w-6 text-black" />
          </div>
        )}
      </Form>
      <div className="grid grid-cols-1 md:grid-cols-2">
        {videos.map((video) => (
          <div className="w-full md:w-1/2 py-4" key={video.id}>
            <div className="bg-white dark:bg-gray-700 dark:text-white rounded-lg">
              <h2 className="text-6xl extra-bold py-4 text-center capitalize">
                {video.sign?.term}
              </h2>
              <div className="bg-white px-4 rounded-md">
                <VideoCard userId={userId || null} video={video} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
