import * as Dialog from "@radix-ui/react-dialog";
import { Form, Link, NavLink, useFetcher, useLocation } from "@remix-run/react";
import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { type loader as rootLoader } from "~/root";
import {
	Home,
	LayoutDashboard,
	UserIcon,
	X,
	Menu,
	Plus,
	SearchIcon,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { flushSync } from "react-dom";
import { Search } from "~/components/SearchDialog";

export type RootUser = Awaited<
	ReturnType<Awaited<ReturnType<typeof rootLoader>>["json"]>
>["user"];

const NAV_LINKS: Record<
	string,
	{
		title: string;
		icon: React.ReactNode;
		condition?: (user: RootUser | null) => boolean;
	}
> = {
	"/": {
		title: "Home",
		icon: <Home size={28} />,
	},
	"/categories": {
		title: "Categories",
		icon: <LayoutDashboard size={28} />,
	},
	// "/trending": {
	// 	title: "Trending",
	// 	icon: <TrendingUp size={28} />,
	// },
	"/dashboard": {
		condition: (user) => Boolean(user),
		title: "Dashboard",
		icon: <UserIcon size={28} />,
	},
	"/sign/create": {
		title: "Create Sign",
		icon: <Plus size={28} />,
	},
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
export function Header({ user }: { user: RootUser | null }) {
	const [open, setOpen] = useState(false);
	const [isSearchVisible, setSearchVisible] = useState(false);
	const isLoggedIn = Boolean(user);
	const searchInput = useRef<HTMLInputElement>(null);
	const loc = useLocation();
	return (
		<header className="flex justify-between items-center px-2 py-0.5 sm:py-2 bg-white fixed w-full z-10">
			<div className="flex justify-between w-full items-center">
				<div className="flex gap-4 items-center relative">
					<NavLink to="/">
						<h1 className="text-2xl">
							<span className="font-bold text-blue-600">dact</span>ylo
						</h1>
					</NavLink>
					<Search />
					{/* <Input
						ref={searchInput}
						// className={`absolute focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-700 ${
						// 	isSearchVisible ? "opacity-100" : "opacity-0"
						// } -right-full border-l-0 rounded-none rounded-r-sm transition-opacity duration-200 ease-in-out`}
						placeholder="Search"
						className="absolute  -right-full translate-x-3 bottom-3 "
					/> */}
				</div>
				<div className="hidden sm:flex">
					<div>
						<ul className="flex gap-6 items-center">
							{Object.entries(NAV_LINKS).map(([path, values]) => {
								const { icon, title } = values;
								if (values.condition && values.condition(user) === false) {
									return null;
								}
								return (
									<li key={path}>
										<NavLink
											to={path}
											className={({ isActive }) =>
												`${isActive ? "text-blue-500 " : "text-grey-200"}`
											}
										>
											<div className="flex flex-col items-center">
												{icon}
												<h4>{title}</h4>
											</div>
										</NavLink>
									</li>
								);
							})}
							{/* <li>
                <SearchInput />
              </li> */}
						</ul>
					</div>
				</div>
				<div className="hidden sm:flex">
					<UserDropdown user={user} />
				</div>
				<div className="flex sm:hidden">
					<Dialog.Root open={open} onOpenChange={setOpen}>
						<Dialog.Trigger
							name="menu-open"
							className="w-12 h-12 text-gray-900"
						>
							<Menu
								size={32}
								className="text-gray-900"
								aria-label="navigation menu button"
							/>
						</Dialog.Trigger>
						<Dialog.Portal>
							<Dialog.Overlay className="bg-gray-800 opacity-70 data-[state=open]:animate-overlayShow fixed inset-0" />
							<Dialog.Content className="z-10 data-[state=open]:animate-contentShow fixed w-screen h-[100svh] top-0 bg-white p-4 focus:outline-none">
								<div className="h-full relative">
									<div className="flex justify-between items-center pb-2">
										<h2 className="text-2xl font-bold">Menu</h2>
										<Dialog.Close className="border-2 m-2 border-gray-900 rounded-full">
											<X size={22} />
										</Dialog.Close>
									</div>
									<div className="py-2">
										<ul className="flex flex-col space-y-3">
											{Object.entries(NAV_LINKS).map(([path, values]) => {
												const { icon, title } = values;
												if (
													values.condition &&
													values.condition(user) === false
												) {
													return null;
												}
												return (
													<li key={path}>
														<NavLink
															className={({ isActive }) =>
																`${
																	isActive
																		? "text-blue-500 font-bold "
																		: "text-grey-200"
																}`
															}
															onClick={() => setOpen(false)}
															to={path}
														>
															<div className="flex gap-x-2 items-center">
																{icon}
																<span>{title}</span>
															</div>
														</NavLink>
													</li>
												);
											})}
										</ul>
									</div>
									<div
										className={`absolute bottom-0 left-0 right-0 p-3 ${
											loc.pathname.startsWith("/dashboard") ? "pb-14" : ""
										}`}
									>
										{isLoggedIn ? (
											<div className="flex justify-between items-center">
												<p>{user?.email}</p>
												<Form
													className="float-right"
													method="POST"
													action="/auth/logout"
													onSubmit={() => {
														setOpen(false);
													}}
												>
													<Button>Logout</Button>
												</Form>
											</div>
										) : (
											<div className="flex justify-center">
												<p>
													<NavLink
														className="bg-primary px-3 py-2 rounded-sm text-primary-foreground hover:underline"
														onClick={() => {
															setOpen(false);
														}}
														to="/auth/login"
													>
														Login
													</NavLink>{" "}
												</p>
											</div>
										)}
									</div>
								</div>
							</Dialog.Content>
						</Dialog.Portal>
					</Dialog.Root>
				</div>
			</div>
		</header>
	);
}

const UserDropdown = ({ user }: { user: RootUser | null }) => {
	const fetcher = useFetcher();
	if (!user) {
		return (
			<Link
				to="/auth/login"
				className="text-white p-2 rounded-md flex items-center gap-x-1 bg-blue-500 hover:bg-blue-600"
			>
				Login
			</Link>
		);
	}
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<div className="flex gap-x-1">
					<Button className="flex items-center gap-x-1 bg-blue-500 hover:bg-blue-600">
						{user.email}
					</Button>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent className="w-40 bg-gray-100 shadow-lg rounded-b-lg">
					<fetcher.Form method="POST" action="/auth/logout">
						<button
							type="submit"
							className="outline-blue-500 w-full text-left p-2"
						>
							Logout
						</button>
					</fetcher.Form>
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	);
};
