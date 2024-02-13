import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "@remix-run/react";
import "~/tailwind.css";
import { csrf } from "./utils/csrf.server";
import { HeadersFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import { AuthenticityTokenProvider } from "remix-utils/csrf/react";
import { Header } from "./components/header";
import { getUserId } from "./services/auth.server";
import { prisma } from "@dactylo/db";
import { NavProgress } from "./components/progress-bar";
import { Toaster } from "sonner";
import { register } from "swiper/element/bundle";

register();

export async function loader({ request }: LoaderFunctionArgs) {
	const [csrfToken, csrfCookieHeader] = await csrf.commitToken();
	const userId = await getUserId(request);
	if (!userId)
		return json(
			{ csrfToken, user: null },
			{
				headers: { "set-cookie": csrfCookieHeader || "" },
			},
		);
	const user = await prisma.user.findUnique({
		select: {
			id: true,
			email: true,
			image: { select: { id: true } },
			roles: {
				select: {
					name: true,
					permissions: {
						select: { entity: true, action: true, access: true },
					},
				},
			},
		},
		where: { id: userId },
	});
	const response = json(
		{ csrfToken, user },
		{
			headers: { "set-cookie": csrfCookieHeader || "" },
		},
	);
	return response;
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	const headers = {
		"set-cookie": loaderHeaders.get("set-cookie") ?? "",
		"Server-Timing": loaderHeaders.get("Server-Timing") ?? "",
	};
	return headers;
};

export default function App() {
	const data = useLoaderData<typeof loader>();
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta httpEquiv="content-language" content="en" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="">
				<AuthenticityTokenProvider token={data.csrfToken}>
					<div className="min-h-[100svh] flex flex-col">
						<Header user={data.user || null} />
						<div className="flex flex-col container p-0 sm:p-4 max-w-full md:max-w-3xl flex-grow mt-20 md:mt-28">
							<Outlet />
						</div>
						<footer className=" hidden md:flex  justify-between items-center px-2 mt-2">
							<p>© 2024 Dactylo</p>
						</footer>
					</div>
					<Toaster />
					<ScrollRestoration />
					<Scripts />
				</AuthenticityTokenProvider>
				<div id="camera-root" />
				<NavProgress />
			</body>
		</html>
	);
}
