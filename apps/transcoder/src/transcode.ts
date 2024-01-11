import { type Sign } from "@dactylo/db/types";
import { mkdir, writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { Readable } from "stream";
import ffmpeg from "fluent-ffmpeg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const filePaths: string[] = [];
const tempDir = "tmp-dir/";

export async function convertToReadable(blob: Blob): Promise<Readable> {
	const reader = blob.stream().getReader();
	const nodeReadable = new Readable({
		async read() {
			const { done, value } = await reader.read();
			if (done) {
				this.push(null);
			} else {
				this.push(Buffer.from(value));
			}
		},
	});

	return nodeReadable;
}

async function writeRawFile(
	file: File,
	name: string,
	id: string,
): Promise<string> {
	const extension = name.split(".")[1];
	const filename = `sign-${id}-raw.${extension}`;

	// Ensure the directory exists
	await mkdir(tempDir, { recursive: true });
	await mkdir(path.join(tempDir, id), { recursive: true });

	// Construct the full path for the file
	const filePath = path.join(tempDir, id, filename);

	// Write the file
	console.log(filename);
	const readable = await convertToReadable(file);
	await writeFile(path.join(tempDir, id, filename), readable);
	filePaths.push(filePath);
	return filePath;
}

function transcodeVideo(inputPath: string, id: string): Promise<string[]> {
	return new Promise((resolve, reject) => {
		const ffmpegCommand = ffmpeg(inputPath);
		const filePaths: string[] = [];

		const resolutions = [
			"480sq",
			"720sq",
			"1080sq",
			"480ws",
			"720ws",
			"1080ws",
		];
		for (const resolution of resolutions) {
			const outputPath = `${tempDir}${id}/sign-${id}_${resolution}.mp4`;
			filePaths.push(outputPath);

			ffmpegCommand
				.output(outputPath)
				.outputOptions([`-map [${resolution}]`, "-c:v libx264"]);
		}

		ffmpegCommand
			.complexFilter([
				"[0:v]scale=480:480:force_original_aspect_ratio=decrease, pad=480:480:(ow-iw)/2:(oh-ih)/2, setsar=1[480sq]",
				"[0:v]scale=720:720:force_original_aspect_ratio=decrease, pad=720:720:(ow-iw)/2:(oh-ih)/2, setsar=1[720sq]",
				"[0:v]scale=1080:1080:force_original_aspect_ratio=decrease, pad=1080:1080:(ow-iw)/2:(oh-ih)/2, setsar=1[1080sq]",
				"[0:v]scale=-2:480[480ws]",
				"[0:v]scale=-2:720[720ws]",
				"[0:v]scale=-2:1080[1080ws]",
			])
			.on("end", async () => {
				resolve(filePaths);
			})
			.on("error", (err) => {
				console.error("Error:", err);
				reject(err);
			})
			.run();
	});
}

export async function transcodeHandler(
	file: File,
	filename: string,
	sign: Sign,
) {
	const id = uuidv4();
	console.log("Transcoding Video...");

	//write file to disk
	const rawFilePath = await writeRawFile(file, filename, id);
	//transcode video
	const transcodedFilePaths = await transcodeVideo(rawFilePath, id);
	return {
		message: "success",
		id,
		files: [...filePaths, ...transcodedFilePaths],
	};
}
