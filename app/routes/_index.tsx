import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
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
import { InfoIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "~/components/ui/popover";

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
  const isSearching = navigation.formAction?.includes("/?index");
  const handleFormChange = useDebounce((form: HTMLFormElement) => {
    submit(form);
  }, 500);
  return (
    <div className="flex flex-col gap-4">
      <Form
        method="GET"
        onChange={(e) => handleFormChange(e.currentTarget)}
        className="relative"
      >
        <Input
          name="search"
          defaultValue={searchParams.get("search") || ""}
          className="h-14 text-xl"
          placeholder="Find a Sign..."
        />

        <div
          className={`absolute top-1/2 right-2 -translate-y-1/2 transition-all duration-400 ease-in-out ${
            isSearching ? "opacity-100" : "opacity-0"
          }`}
        >
          <Spinner className=" animate-spin  -ml-1 mr-3 h-6 w-6 text-black" />
        </div>
      </Form>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map((video) => (
          <div key={video.id} className="w-full">
            <div className="bg-white dark:bg-gray-700 dark:text-white rounded-lg overflow-hidden">
              <div className="flex items-center px-1.5">
                <Link
                  to={`/sign/${video.sign.id}`}
                  className="text-4xl extra-bold py-4 text-center capitalize"
                >
                  {video.sign?.term}
                </Link>
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
        ))}
      </div>
    </div>
  );
}
