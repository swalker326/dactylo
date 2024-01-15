import { mkdir, writeFile, rm } from "fs/promises";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import * as dotenv from "dotenv";
import { TranscodingJobArgs } from "./TranscoderQueue";
import { uploadHandler } from "./storage";

dotenv.config({ path: ".env" });

const filePaths: string[] = [];

async function writeRawFile(
	file: Blob,
	name: string,
	id: string,
	tmpDir: string,
): Promise<string> {
	try {
		const extension = name.split(".").pop();
		const filename = `sign-${id}-raw.${extension}`;
		const dirPath = path.join(tmpDir, id);

		// Ensure the directory exists
		await mkdir(dirPath, { recursive: true });

		// Construct the full path for the file
		const filePath = path.join(dirPath, filename);

		// Write the file
		const buffer = Buffer.from(await file.arrayBuffer());
		await writeFile(filePath, buffer);
		filePaths.push(filePath);
		return filePath;
	} catch (error) {
		console.error("Error writing raw file:", error);
		if (error instanceof Error && error.message) {
			throw new Error(`Failed to write raw file: ${error.message}`);
		}

		throw new Error(`Failed to write raw file: ${error}`);
	}
}

export function transcodeVideo(
	inputPath: string,
	id: string,
	tmpDir: string,
): Promise<string[]> {
	return new Promise((resolve, reject) => {
		const ffmpegCommand = ffmpeg(path.resolve(inputPath));
		const outputFilePaths: string[] = [];

		const resolutions = [
			"480sq",
			"720sq",
			"1080sq",
			"480ws",
			"720ws",
			"1080ws",
		];
		for (const resolution of resolutions) {
			console.log("Transcoding:", resolution);
			const outputPath = `${tmpDir}${id}/sign-${id}-${resolution}.mp4`;
			outputFilePaths.push(outputPath);

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
			.on("end", () => {
				console.log("Transcoding complete");
				return resolve(outputFilePaths);
			})
			.on("error", (err) => {
				console.error("Transcoding error:", err);
				reject(new Error(`Transcoding failed: ${err.message}`));
			})
			.run();
	});
}

export async function transcodeHandler(args: TranscodingJobArgs) {
	const { file, filename, tempDir: tmpDir, id } = args;
	try {
		const rawFilePath = await writeRawFile(file, filename, id, tmpDir);
		const transcodedFilePaths = await transcodeVideo(rawFilePath, id, tmpDir);
		const uploadPromises = transcodedFilePaths.map((file) => {
			return uploadHandler({ path: file, id });
		});
		Promise.all(uploadPromises)
			.then(() => {
				console.log("Files Uploaded");
				rm(`${tmpDir}${id}`, { recursive: true, force: true }).then(() => {
					console.log(`${id} dir removed`);
				});
			})
			.catch((err) => {
				console.error("Error Uploading files:", err);
			});
		return {
			message: "success",
			id,
			files: [rawFilePath, ...transcodedFilePaths],
		};
	} catch (error) {
		console.error("Error in transcoding handler:", error);
		if (error instanceof Error) {
			return {
				message: "error",
				error: error.message,
			};
		}
		return {
			message: "error",
			error: "unknown error",
		};
	}
}
