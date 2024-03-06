import { SearchIcon, X } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Link, useFetcher } from "@remix-run/react";
import { action as searchAction } from "~/routes/search/route";
import { useState } from "react";

const hasValidSearchResults = (
	searchResults:
		| {
				categories: unknown[];
				signs: unknown[];
		  }
		| undefined,
) => {
	if (searchResults?.categories && searchResults.categories.length > 0) {
		return true;
	}
	if (searchResults?.signs && searchResults.signs.length > 0) {
		return true;
	}

	return false;
};

export function Search({ trigger }: { trigger?: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	let {
		submit,
		state,
		Form: SearchForm,
		data: searchResults,
	} = useFetcher<typeof searchAction>({ key: "search" });
	const handleSearch = (value: string) => {
		if (!value) {
			searchResults = undefined;
		}
		const fd = new FormData();
		fd.append("searchTerm", value);
		submit(fd, { method: "POST", action: "/search" });
	};
	return (
		<div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					{trigger || (
						<Button variant="ghost" className="px-0.5 py-0.5 text-blue-500">
							<SearchIcon className="w-7 h-7" />
						</Button>
					)}
				</DialogTrigger>
				<DialogContent className="sm:max-w-[625px]">
					<div className="min-h-96 flex flex-col gap-y-2">
						<SearchForm
							action="/search"
							method="POST"
							onChange={(e) => {
								if ("searchTerm" in e && typeof e.searchTerm === "string") {
									handleSearch(e.searchTerm);
								}
								return null;
							}}
						>
							<div className="relative pt-6 ">
								<SearchIcon className=" absolute left-2 top-[2.1rem] w-5 h-5 text-gray-500"/>
								<Input
									name="searchTerm"
									onChange={(e) => {
										if (e.currentTarget?.value) {
											handleSearch(e.currentTarget.value);
										}
									}}
									className="pl-8"
									type="text"
									placeholder="Search"
								/>
							</div>
						</SearchForm>
						<div>
							{state === "loading" ? (
								<div>Loading...</div>
							) : hasValidSearchResults(searchResults) ? (
								<div className="flex flex-col gap-y-6">
									{searchResults?.signs && searchResults.signs.length > 0 && (
										<div>
											<p className=" text-lg pb-1 font-mono text-blue-400">
												Signs
											</p>
											{searchResults.signs.map((sign) => {
												return (
													<div className="pl-2">
														<Link
															to={`/sign/${sign.id}`}
															onClick={() => setOpen(false)}
														>
															<div className="flex gap-x-2 items-start">
																<p
																	className="font-bold capitalize "
																	key={sign.id}
																>
																	{sign.term.word}
																</p>
																<p className="text-gray-500">{sign.example}</p>
															</div>
														</Link>
													</div>
												);
											})}
										</div>
									)}
									{searchResults?.categories &&
										searchResults.categories.length > 0 && (
											<div>
												<p className=" text-lg pb-1 font-mono text-blue-400">
													Categories
												</p>
												{searchResults.categories.map((category) => {
													return (
														<div className="flex gap-x-2 items-end pl-2">
															<Link
																to={`/categories/${category.slug}`}
																onClick={() => setOpen(false)}
															>
																<p className="font-bold" key={category.id}>
																	{category.name}
																</p>
															</Link>
														</div>
													);
												})}
											</div>
										)}
								</div>
							) : (
								<>
									<p className="">
										Can't find what you're looking for?{" "}
										<Link
											onClick={() => setOpen(false)}
											to="/sign/create"
											className="font-mono text-blue-500"
										>
											Request a new sign
										</Link>
									</p>
								</>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
