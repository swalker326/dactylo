import { json } from "@remix-run/node";
import { prisma } from "@dactylo/db";
import { requireUserId } from "~/services/auth.server.js";
import { useUser } from "~/utils/user.js";
import { Prisma, User } from "@dactylo/db/types";

const userWithRoles = Prisma.validator<Prisma.UserDefaultArgs>()({
	include: { roles: true },
});
export type UserWithRoles = Prisma.UserGetPayload<typeof userWithRoles>;

export async function requireUserWithPermission(
	request: Request,
	permission: PermissionString,
) {
	const userId = await requireUserId(request);
	const permissionData = parsePermissionString(permission);
	const user = await prisma.user.findFirst({
		select: { id: true },
		where: {
			id: userId,
			roles: {
				some: {
					permissions: {
						some: {
							...permissionData,
							access: permissionData.access
								? { in: permissionData.access }
								: undefined,
						},
					},
				},
			},
		},
	});
	if (!user) {
		throw json(
			{
				error: "Unauthorized",
				requiredPermission: permissionData,
				message: `Unauthorized: required permissions: ${permission}`,
			},
			{ status: 403 },
		);
	}
	return user.id;
}

export async function requireUserWithRole(request: Request, name: string) {
	const userId = await requireUserId(request);
	const user = await prisma.user.findFirst({
		select: { id: true },
		where: { id: userId, roles: { some: { name } } },
	});
	if (!user) {
		throw json(
			{
				error: "Unauthorized",
				requiredRole: name,
				message: `Unauthorized: required role: ${name}`,
			},
			{ status: 403 },
		);
	}
	return user.id;
}

type Action = "create" | "read" | "update" | "delete";
type Entity = "user" | "note";
type Access = "own" | "any" | "own,any" | "any,own";
type PermissionString = `${Action}:${Entity}` | `${Action}:${Entity}:${Access}`;
function parsePermissionString(permissionString: PermissionString) {
	const [action, entity, access] = permissionString.split(":") as [
		Action,
		Entity,
		Access | undefined,
	];
	return {
		action,
		entity,
		access: access ? (access.split(",") as Array<Access>) : undefined,
	};
}

export function userHasPermission(
	user: Pick<ReturnType<typeof useUser>, "roles"> | null | undefined,
	permission: PermissionString,
) {
	if (!user) return false;
	const { action, entity, access } = parsePermissionString(permission);
	return user.roles.some((role) =>
		role.permissions.some(
			(permission) =>
				permission.entity === entity &&
				permission.action === action &&
				(!access || access.includes(permission.access as Access)),
		),
	);
}


export function userHasRole(user: UserWithRoles | null, role: string) {
	if (!user) return false;
	return user.roles.some((r) => r.name === role);
}
