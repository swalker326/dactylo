import { S3Client } from "@aws-sdk/client-s3";

import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream } from "fs";
import { Readable } from "stream";
import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

export const FileUploadResponseSchema = z.object({
	filename: z.string(),
	url: z.string(),
});

const { STORAGE_ACCESS_KEY, STORAGE_SECRET, STORAGE_ENDPOINT } = process.env;

if (!STORAGE_ENDPOINT) {
	throw new Error("STORAGE_ENDPOINT is missing required configuration.");
}

if (!STORAGE_ACCESS_KEY) {
	throw new Error("STORAGE_ACCESS_KEY is missing required configuration.");
}

if (!STORAGE_SECRET) {
	throw new Error("STORAGE_SECRET is missing required configuration.");
}

const storage = new S3Client({
	endpoint: STORAGE_ENDPOINT,
	credentials: {
		accessKeyId: STORAGE_ACCESS_KEY,
		secretAccessKey: STORAGE_SECRET,
	},

	// This is only needed for the AWS SDK and it must be set to their region
	region: "us-east-1",
});

export async function uploadStreamToSpaces(
	stream: Uint8Array | Buffer | Readable,
	filename: string,
) {
	return new Upload({
		client: storage,
		leavePartsOnError: false,
		params: {
			Bucket: "dact",
			Key: filename,
			Body: stream,
			ContentType: "video/mp4",
		},
	}).done();
}

export const uploadHandler = async ({
	path,
	id,
}: {
	path: string;
	id: string;
}) => {
	console.log("Uploading:", path);
	const filename = path.split("/").splice(1, 2).join("/");
	// const videoUrl = `https://media.dactylo.io/${id}/${filename}`;
	const file = createReadStream(path);

	const upload = await uploadStreamToSpaces(file, `${filename}`);
	if (upload.$metadata.httpStatusCode === 200) {
		return {
			status: "success",
			errors: [],
		};
	}

	return { errors: ["Upload failed"], status: "error" };
};
