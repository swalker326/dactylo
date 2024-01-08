import { prisma } from "@dactylo/db";
import { Route } from "src/Server";
import { uploadHandler } from "src/storage";
import { transcodeHandler } from "src/transcode";

export default function PingRoute(): Route {
	return {
		path: "/upload",
		method: "POST",
		async handler(req) {
			{
				// TODO: check if user is logged in

				console.log("upload...");
				const data = await req?.formData();
				console.log("HELLO THERE!", data);
				for (const [key, value] of data.entries()) {
					console.log(key, value);
				}
				const file = data.get("file");
				const signId = data.get("sign");

				if (!file || !(file instanceof File)) {
					console.log("no file", file);
					const responseBody = { message: "File not found" };
					const response = new Response(JSON.stringify(responseBody), {
						status: 200, // Set the status code
						headers: {
							"Content-Type": "application/json", // Set the content type to JSON
						},
					});
					return response;
				}
				const filename = file.name;
				if (!signId || Array.isArray(signId)) {
					console.log("no signId", signId);
					const responseBody = { message: "Sign ID not found" };
					const response = new Response(JSON.stringify(responseBody), {
						status: 200, // Set the status code
						headers: {
							"Content-Type": "application/json", // Set the content type to JSON
						},
					});
					return response;
				}
				const sign = await prisma.sign.findUnique({
					where: {
						id: signId as string,
					},
				});
				if (!sign) {
					console.log("no sign found", signId);
					const responseBody = { message: "Sign not found" };
					const response = new Response(JSON.stringify(responseBody), {
						status: 200, // Set the status code
						headers: {
							"Content-Type": "application/json", // Set the content type to JSON
						},
					});
					return response;
				}
				const { files, id } = await transcodeHandler(file, filename, sign);
				for (const file of files) {
					await uploadHandler({ path: file, id });
				}
				const responseBody = { message: "success", id };
				const response = new Response(JSON.stringify(responseBody), {
					status: 200, // Set the status code
					headers: {
						"Content-Type": "application/json", // Set the content type to JSON
					},
				});
				return response;
			}
		},
	};
}
