import * as dotenv from "dotenv";
import { Server } from "./Server";

dotenv.config({ path: ".env" });
const server = new Server({ port: 8080 });
server.loadRoutes("./routes/").then(() => {
	server.start();
});

// export default new Router().get("/ping", async (request, reply) => {
//   console.log("REQ OriginURL", request.hostname)
//   reply.status(200);
//   return reply.send({ message: "pong" });
// }).post("/upload", async (req, reply) => {});
// const fastify = Fastify({
// 	logger: true,
// });
// fastify.register(multipart);
// fastify.register(cors, {
// 	origin: ["http://localhost:3000", "https://staging.dactylo.io"],
// });

// // const uploadHandler = async (c: Hono.Context) => { }

// fastify.get("/ping", async (request, reply) => {
// 	console.log("REQ OriginURL", request.hostname)
//   reply.status(200);
// 	return reply.send({ message: "pong" });
// });

// fastify.post("/upload", async (req, reply) => {
// 	// TODO: check if user is logged in
// 	console.log("upload...");
// 	const data = await req.file();
// 	const file = data?.file;
// 	let filename = data?.filename;
// 	const signId = data?.fields.sign;
// 	console.log("data", data);

// 	if (!filename) {
// 		console.log("no filename", filename);
// 		filename = "file.webm";
// 	}
// 	if (!file) {
// 		console.log("no file", file);
// 		return reply.status(400).send({ message: "File not found" });
// 	}
// 	if (!signId || Array.isArray(signId)) {
// 		console.log("no signId", signId);
// 		return reply.status(400).send({ message: "Sign not found" });
// 	}
// 	const sign = await prisma.sign.findUnique({
// 		where: {
// 			// @ts-ignore
// 			id: signId.value,
// 		},
// 	});
// 	if (!sign) {
// 		console.log("no sign found", signId);
// 		return reply.status(400).send({ message: "Sign not found" });
// 	}
// 	const { files, id } = await transcodeHandler(file, filename, sign);
// 	for (const file of files) {
// 		await uploadHandler({ path: file, id });
// 	}
// 	return reply.status(200).send({ message: "success", id });
// });
// let port = 8080;
// if (process.env.PORT) {
// 	port = parseInt(process.env.PORT);
// }
// try {
// 	await fastify.listen({ port });
// } catch (err) {
// 	fastify.log.error(err);
// 	process.exit(1);
// }
