import { prisma } from "@dactylo/db";
import { Route, createErrorResponse } from "src/Server";
import { uploadHandler } from "src/storage";
import { transcodeHandler } from "src/transcode";

export default function UploadRoute(): Route {
	return {
		path: "/upload",
		method: "POST",
		async handler(req) {
			try {
				// TODO: check if user is logged in

				console.log("Uploading file...");

				const data = await req?.formData();
				const file = data.get("file");
				const signId = data.get("sign");

				if (!file || !(file instanceof File)) {
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
				const { files, id } = await transcodeHandler(file, filename, sign);
				for (const file of files) {
					await uploadHandler({ path: file, id });
				}
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
