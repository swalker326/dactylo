import { Route } from "src/Server";

export default function PingRoute(): Route {
	return {
		path: "/ping",
		get() {
			const response = new Response("What if I told you... I'm alive?", {
				status: 200,
			});
			return response;
		},
	};
}
