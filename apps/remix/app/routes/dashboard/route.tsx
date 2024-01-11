// import { Prisma, User } from "@prisma/client";
import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { CameraIcon, Home, Settings, ShieldEllipsis } from "lucide-react";
import { prisma } from "@dactylo/db";
import { requireUserId } from "~/services/auth.server";
import { userHasRole } from "~/utils/permissions.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request);
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
	const isAdmin = userHasRole(user, "admin");
	return { user, isAdmin };
}

export const meta: MetaFunction = () => {
	return [
		{
			title: "Dactylo | Dashboard",
			keywords: "asl, american sign language, learn, teach, dactylo",
		},
		{ name: "description", content: "Learning ASL with others" },
	];
};

const NAV_LINKS: Record<
	string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	{
		name: string;
		icon: React.ReactNode;
		condition?: (condition: boolean) => boolean;
	}
> = {
	"/dashboard": { name: "Home", icon: <Home /> },
	"/dashboard/create": { name: "Create", icon: <CameraIcon /> },
	"/dashboard/settings": { name: "Settings", icon: <Settings /> },
	"/dashboard/admin": {
		name: "Admin",
		icon: <ShieldEllipsis />,
		condition: (isAdmin) => isAdmin,
	},
};

export default function DashboardRoute() {
	const { isAdmin } = useLoaderData<typeof loader>();
	return (
		<div className="flex flex-col h-full">
			<div className="fixed bottom-0 flex justify-evenly bg-white right-0 left-0 z-10 max-w-[100svw] h-[60px] ">
				{Object.entries(NAV_LINKS).map(([path, values]) => {
					if (values.condition && values.condition(isAdmin) === false) {
						return null;
					}
					const { name, icon: Icon } = values;
					return (
						<NavLink
							key={name}
							unstable_viewTransition
							end
							className={({ isActive }) => {
								return `px-2 py-2 w-full flex justify-center items-center flex-1 text-black ${
									isActive ? "bg-blue-600 text-white" : ""
								}`;
							}}
							to={path}
						>
							{Icon}
						</NavLink>
					);
				})}
			</div>
			<div className="pb-12">
				<Outlet />
			</div>
		</div>
	);
}
