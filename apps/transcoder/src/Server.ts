import { readdir } from "node:fs/promises";
import path from "node:path";

type RouteReqParams = {
	path: string;
	method: string;
	headers: Headers;
	body: ReadableStream<unknown> | null;
	query: URLSearchParams;
};
type RouteHandler = (
	request: Request,
	reqShorthand: RouteReqParams,
) => Response | Promise<Response>;
export type Route = {
	path: string;
	method: string;
	handler: RouteHandler;
};
type Options = {
	port: number;
};

export class Server {
	port: number;
	routes: Record<string, Route> = {};
	constructor(options: Options) {
		this.port = options.port || 8080;
	}
	start() {
		this.loadRoutes("/routes/");
		Bun.serve({
			port: this.port,
			fetch: async (req) => {
				const { path, method, headers, body, query } = processRequest(req);
				const route = this.routes[path];

				if (Boolean(route) && route.method === method) {
					console.log("Found route", this.routes[path]);
					return await this.routes[path].handler(req, {
						path,
						method,
						headers,
						body,
						query,
					});
				}
				return new Response("Not found", { status: 404 });
			},
		});
		console.log("Server started on port", this.port);
	}
	get({ path, handler }: { path: string; handler: RouteHandler }) {
		this.routes[path] = { path, method: "GET", handler };
	}
	post({ path, handler }: { path: string; handler: RouteHandler }) {
		this.routes[path] = { path, method: "POST", handler };
	}
	async loadRoutes(routesDir: string) {
		// console.log("Loading routes from:", path);
		console.log("import.meta.dir", path.resolve("src/routes/"));
    const dir = path.resolve("src/routes/");
		const files = await readdir(dir);
		for (const file of files) {
			const route = await import(`${dir}/${file}`);
			this.routes[route.default().path] = route.default();
		}
		// console.log("Loaded routes:", this.routes);
	}
}

const processRequest = (req: Request) => {
	const url = new URL(req.url);
	const path = url.pathname;
	const method = req.method;
	const headers = req.headers;
	const body = req.body;
	const query = url.searchParams;
	// console.log("url", url);
	// console.log("path", path);
	// console.log("method", method);
	// console.log("headers", headers);
	// console.log("body", body);
	// console.log("query", query);
	console.log("PATH::", path);
	return { path, method, headers, body, query };
};
