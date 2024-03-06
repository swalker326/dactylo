import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import {
	Form,
	Link,
	useFetcher,
	useNavigation,
	useSearchParams,
	useSubmit,
} from "@remix-run/react";
import Spinner from "~/icons/spinner.svg?react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Input } from "~/components/ui/input";
import { prisma } from "@dactylo/db";
import { useDebounce } from "~/hooks/useDebounce";
import { getUserId } from "~/services/auth.server";
import { Image, Plus, PlusCircleIcon, SearchIcon } from "lucide-react";
import { SignVideoCarousel } from "~/components/SignVideoCarousel";
import { useEffect, useRef, useState } from "react";
import { fetchSignsForInfiniteScroll } from "~/components/infinite-scroll.server";
import { Search } from "~/components/SearchDialog";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
	return [
		{ title: "Dactylo" },
		{ name: "description", content: "Learning ASL with others" },
	];
};

export async function loader({ request }: LoaderFunctionArgs) {
	const maybeUser = await getUserId(request);
	const url = new URL(request.url);
	const searchTerm = url.searchParams.get("search");

	if (searchTerm) {
		const signs = await prisma.sign.findMany({
			where: {
				term: { word: { contains: searchTerm } },
				videos: { some: { status: "ACTIVE" } },
			},
			include: {
				term: true,
				videos: {
					where: { status: "ACTIVE" },
					include: { votes: true, favorites: true },
				},
			},
		});
		const search = await prisma.search.create({
			data: {
				term: searchTerm,
				...(maybeUser && { user: { connect: { id: maybeUser } } }),
			},
		});
		await Promise.all(
			signs.map(async (sign) => {
				await prisma.searchSign.create({
					data: {
						search: { connect: { id: search.id } },
						sign: { connect: { id: sign.id } },
					},
				});
			}),
		);

		return typedjson({ signs, nextCursor: null, userId: maybeUser });
	}
	const { signs, nextCursor } = await fetchSignsForInfiniteScroll({
		pageSize: 5,
		cursor: undefined,
	});
	return typedjson({ signs, nextCursor, userId: maybeUser });
}
export async function action({ request }: LoaderFunctionArgs) {
	const formData = await request.formData();
	const cursor = formData.get("cursor");
	const { signs, nextCursor } = await fetchSignsForInfiniteScroll({
		pageSize: 5,
		cursor: cursor as string,
	});
	return typedjson({ signs, nextCursor });
}

export default function Index() {
	const { signs, nextCursor, userId } = useTypedLoaderData<typeof loader>();
	const submit = useSubmit();
	const [currentCursor, setCurrentCursor] = useState(nextCursor);
	const [searchParams] = useSearchParams();
	const loadMoreRef = useRef<HTMLDivElement>(null);
	const [currentSigns, setCurrentSigns] = useState<typeof signs>(signs);
	const navigation = useNavigation();
	const isSearching = navigation.formAction?.includes("/?index");
	const {
		data,
		submit: fetcherSubmit,
		state: loadMoreState,
	} = useFetcher<typeof loader>({
		key: "load-more",
	});
	const handleFormChange = useDebounce((form: HTMLFormElement) => {
		submit(form);
	}, 500);
	const loadMore = async () => {
		fetcherSubmit({ cursor: currentCursor }, { method: "POST" });
	};

	// Add Listeners to scroll and client resize
	useEffect(() => {
		if (isSearching) return;
		const observer = new IntersectionObserver(
			async (entries) => {
				if (entries[0].isIntersecting && nextCursor) {
					// Fetch the next batch of posts
					if (!currentCursor) return;
					if (loadMoreState === "idle") {
						loadMore().then(() => {
							if (data && data.signs.length > 0) {
								setCurrentCursor(data.nextCursor);
								setCurrentSigns((prev) => [...prev, ...data.signs]);
							}
						});
					}
				}
			},
			{ rootMargin: "200px", threshold: 1.0 },
		);

		if (loadMoreRef.current) {
			observer.observe(loadMoreRef.current);
		}

		return () => observer.disconnect();
	}, [nextCursor, loadMore]);

	return (
		<div className="flex flex-col gap-4">
			<div className="bg-white w-full p-1.5 py-3 rounded-lg">
				<div className="flex justify-around w-full px-10 py-3 font-bold">
					<div className="p-2 hover:bg-gray-100 rounded-md">
						<Search
							trigger={
								<div className="text-blue-500 cursor-pointer">
									<div className="flex items-center gap-2 flex-col">
										<SearchIcon aria-label="view sign info" size={23} />
										<p className="text-black dark:text-white">Search</p>
									</div>
								</div>
							}
						/>
					</div>
					<div className="p-2 hover:bg-gray-100 rounded-md">
						<Link to="/dashboard/create">
							<div className="text-blue-500">
								<div className="flex flex-col items-center gap-2">
									<PlusCircleIcon aria-label="view sign info" size={23} />
									<p className="text-black dark:text-white">Create</p>
								</div>
							</div>
						</Link>
					</div>
					<div className="p-2 hover:bg-gray-100 rounded-md">
						<Link to="/dashboard">
							<div className="text-green-600">
								<div className="flex items-center gap-2 flex-col">
									<Image size={23} />
									<p className="text-black dark:text-white">Your Videos</p>
								</div>
							</div>
						</Link>
					</div>
				</div>
			</div>
			<div className="grid grid-cols-1 gap-4">
				{currentSigns.length > 0 ? (
					currentSigns.map((sign) =>
						sign.videos.length > 0 ? (
							<SignVideoCarousel key={sign.id} sign={sign} userId={userId} />
						) : (
							<div key={sign.id} className="rounded-sm px-1.5 py-3 bg-white">
								<p className="text-body">
									No videos for{" "}
									<span className="text-body-xl">{sign.term.word} 😢</span>
								</p>

								<p>definition: {sign.definition}</p>
							</div>
						),
					)
				) : (
					<div className="bg-white rounded-md p-2">
						<h1 className="text-xl font-bold text-center">No Signs Found 😢</h1>
						<div className="flex items-center justify-center p-3">
							<Link
								className="w-1/2 items-center gap-1 flex justify-center p-3 text-lg font-bold  rounded-md hover:bg-blue-600 bg-blue-500 hover:text-white text-white"
								to="/sign/create"
							>
								<span>Request One</span> <Plus />
							</Link>
						</div>
					</div>
				)}
			</div>
			<div ref={loadMoreRef} className="flex justify-center ">
				<Spinner
					className={`animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500 ${
						loadMoreState === "submitting" ? "opacity-100" : "opacity-0"
					} ease-out duration-200`}
				/>
			</div>
		</div>
	);
}
