import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";
import { tmpdir } from "os";
import { unlink, writeFile, readFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
// import { FileUploadResponseSchema, uploadHandler } from "./storage.server";

export function generateFileName({
  name,
  prefix
}: {
  name: string;
  prefix: string;
}) {
  const key = uuidv4();
  const sanitizedWord = sanitizeWord(name);

  return { name: `${prefix}-${sanitizedWord}-${key}`, key };
}

function sanitizeWord(word: string) {
  // Converts to lowercase
  // Replace spaces with underscores
  // Removes special characters except for underscore
  let sanitizedWord = word.toLowerCase();
  sanitizedWord = sanitizedWord.replace(/\s+/g, "_");
  sanitizedWord = sanitizedWord.replace(/[^a-z0-9_]/g, "");
  return sanitizedWord;
}

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
    }
  });

  return nodeReadable;
}

export async function convertToMp4({
  video,
  name
}: {
  video: File;
  name: string;
}): Promise<{ mp4File: File; message: string }> {
  const inputPathName = `${name}.${video.name.split(".")[1]}`;
  const outputPathName = `${name}.mp4`;
  if (inputPathName === outputPathName) {
    return { mp4File: video, message: "No conversion needed" };
  }
  const inputPath = join(tmpdir(), `${name}.${video.name.split(".")[1]}`);
  const outputPath = join(tmpdir(), `${name}.mp4`);

  const readableVideo = await convertToReadable(video);
  await writeFile(inputPath, readableVideo);

  const cleanUp = async () => {
    await unlink(inputPath);
    await unlink(outputPath);
  };
  return new Promise((resolve, reject) => {
    //ffmpeg -i input -c:v libx264 -profile:v main -vf format=yuv420p -c:a aac -movflags +faststart output.mp4

    ffmpeg(inputPath)
      .outputOption("-c:v", "libx264")
      .outputOption("-profile:v", "main")
      .outputOption("-vf", "format=yuv420p")
      .outputOption("-movflags", "+faststart")
      .outputOption("-c:a", "aac")
      .save(outputPath)
      .on("end", async () => {
        const mp4 = await readFile(outputPath);
        const mp4File = new File([mp4], outputPathName);
        console.log("mp4", mp4File);
        await cleanUp();
        resolve({
          mp4File,
          message: "Success"
        });
      })
      .on("error", (err) => reject(err));
  });
}
