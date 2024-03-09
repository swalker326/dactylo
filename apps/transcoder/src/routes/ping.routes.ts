import { prisma } from "@dactylo/db";
import { Route } from "src/Server";

export default function PingRoute(): Route {
	return {
		path: "/ping",
		get: async () => {
			const dog = await prisma.sign.findMany({
				where: { term: { word: { contains: "dog" } } },
			});
			console.log(dog)
			const response = new Response("What if I told you... I'm alive?", {
				status: 200,
			});
			return response;
		},
	};
}
