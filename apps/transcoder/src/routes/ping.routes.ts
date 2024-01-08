export default function PingRoute() {
	return {
		path: "/ping",
		method: "GET",
		handler() {
			return new Response("Hello Bun!!!!!!");
		},
	};
}
