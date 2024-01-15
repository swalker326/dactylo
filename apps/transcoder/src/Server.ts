import { readdir } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { EncoderQueue, EncoderWorker } from "./TranscoderQueue";

type RouteReqParams = {
	path: string;
	method: string;
	headers: Headers;
	body: ReadableStream<unknown> | null;
	query: URLSearchParams;
	queue: EncoderQueue;
};
type RouteHandler = (
	request: Request,
	reqShorthand: RouteReqParams,
) => Response | Promise<Response>;
const requestMethodSchema = z.enum(["GET", "POST", "UPDATE", "DELETE"]);
export type BaseRoute = {
	path: string;
};
export type Route = BaseRoute & {
	[key in Lowercase<typeof requestMethodSchema._type>]?: RouteHandler;
};
type Options = {
	port: number;
};

export class Server {
	port: number;
	routes: Record<string, Route> = {};
	queue: EncoderQueue = new EncoderQueue();
	worker = new EncoderWorker(this.queue);
	constructor(options: Options) {
		this.port = options.port || 8080;
	}
	start() {
		this.loadRoutes("./routes/");
		Bun.serve({
			port: this.port,
			fetch: async (req) => {
				const { path, method, headers, body, query } = processRequest(req);
				const route = this.routes[path];
				const validatedMethod = requestMethodSchema.parse(method);

				if (route) {
					const handler =
						route[validatedMethod.toLocaleLowerCase() as keyof Route];
					if (!handler || typeof handler !== "function") {
						return new Response("invalid", { status: 404 });
					}
					const handlerResponse = await handler(req, {
						path,
						method,
						headers,
						body,
						query,
						queue: this.queue,
					});
					return handlerResponse;
				}
				return new Response("Not found", { status: 404 });
			},
		});
		console.log(`====>Server started on port, ${this.port}<====`);
	}
	async loadRoutes(routesDir: string) {
		const dir = path.resolve(import.meta.dir, routesDir);
		const files = await readdir(dir);
		for (const file of files) {
			const route = await import(`${dir}/${file}`);
			this.routes[route.default().path] = route.default();
		}
	}
}

const processRequest = (req: Request) => {
	const url = new URL(req.url);
	const path = url.pathname;
	const method = req.method;
	const headers = req.headers;
	const body = req.body;
	const query = url.searchParams;
	return { path, method, headers, body, query };
};

export function createErrorResponse(message: string, statusCode = 400) {
	return new Response(JSON.stringify({ error: message }), {
		status: statusCode,
		headers: { "Content-Type": "application/json" },
	});
}
