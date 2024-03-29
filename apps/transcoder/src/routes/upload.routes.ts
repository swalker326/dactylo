import { prisma } from "@dactylo/db";
import { Route, createErrorResponse } from "src/Server";
import { v4 as uuidv4 } from "uuid";
import { transcodeHandler } from "src/transcode";

export default function UploadRoute(): Route {
	return {
		path: "/upload",
		async post(req, { queue }) {
			const tempDir = "tmp-dir/";
			try {
				// TODO: check if user is logged in

				console.log("Uploading file...");

				const data = await req?.formData();
				const file = data.get("file");
				const signId = data.get("sign");
				if (!file || !(file instanceof Blob)) {
					console.error("no file", file);
					return createErrorResponse("file not found", 400);
				}
				const filename = file.name;
				if (!signId || Array.isArray(signId)) {
					console.error("no signId", signId);
					return createErrorResponse("signId not found", 400);
				}
				const sign = await prisma.sign.findUnique({
					where: {
						id: signId as string,
					},
				});
				if (!sign) {
					console.error("no sign", sign);
					return createErrorResponse("sign not found", 400);
				}
				const id = uuidv4();
				queue.add(transcodeHandler, { file, filename, tempDir, id });
				return new Response(JSON.stringify({ message: "success", id }), {
					status: 200,
					headers: {
						"Content-Type": "application/json",
					},
				});
			} catch (error) {
				return createErrorResponse("An unexpected error occurred", 500);
			}
		},
	};
}
