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
import { prisma } from "~/db.server";
import { useDebounce } from "~/hooks/useDebounce";
import { getUserId } from "~/services/auth.server";
import { Image, PlusCircleIcon } from "lucide-react";
import { SignVideoCarousel } from "~/components/SignVideoCarousel";

export const meta: MetaFunction = () => {
  return [
    { title: "Dactylo" },
    { name: "description", content: "Learning ASL with others" }
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const maybeUser = await getUserId(request);
  const searchTerm = new URL(request.url).searchParams.get("search");
  console.log("SEARCH TERM: ", searchTerm);
  if (searchTerm) {
    const signs = await prisma.sign.findMany({
      where: {
        term: { contains: searchTerm },
        videos: { some: { status: "ACTIVE" } }
      },
      include: {
        videos: {
          where: { status: "ACTIVE" },
          include: { sign: true, votes: true, favorites: true }
        }
      }
    });

    const search = await prisma.search.create({
      data: {
        term: searchTerm,
        ...(maybeUser && { user: { connect: { id: maybeUser } } })
      }
    });
    await Promise.all(
      signs.map(async (sign) => {
        await prisma.searchSign.create({
          data: {
            search: { connect: { id: search.id } },
            sign: { connect: { id: sign.id } }
          }
        });
      })
    );

    return typedjson({ signs, userId: maybeUser });
  }
  const signs = await prisma.sign.findMany({
    where: {
      videos: { some: { status: "ACTIVE" } }
    },
    include: {
      videos: {
        where: { status: "ACTIVE" },
        include: { votes: true, favorites: true }
      }
    },
    take: 10,
    orderBy: { updatedAt: "desc" }
  });
  return typedjson({ signs, userId: maybeUser });
}

export default function Index() {
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const submit = useSubmit();
  const { signs, userId } = useTypedLoaderData<typeof loader>();
  const isSearching = navigation.formAction?.includes("/?index");
  const handleFormChange = useDebounce((form: HTMLFormElement) => {
    submit(form);
  }, 500);
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white w-full p-1.5 py-3">
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
        <div className="flex justify-center gap-12 bg-white w-full px-10 py-3 font-bold">
          <Link to="/dashboard/create">
            <div className="text-blue-500">
              <div className="flex items-center gap-2">
                <PlusCircleIcon size={23} />
                <p className="text-black dark:text-white">Create</p>
              </div>
            </div>
          </Link>
          <Link to="/dashboard">
            <div className="text-green-600">
              <div className="flex items-center gap-2">
                <Image size={23} />
                <p className="text-black dark:text-white">Your Videos</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {signs.map(
          (sign) =>
            sign.videos.length > 0 && (
              <SignVideoCarousel key={sign.id} sign={sign} userId={userId} />
            )
        )}
      </div>
    </div>
  );
}
