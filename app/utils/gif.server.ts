import ffmpeg from "fluent-ffmpeg";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";
import { tmpdir } from "os";
import { unlink, writeFile, readFile } from "fs/promises";
import { join } from "path";
import { FileUploadResponseSchema, uploadHandler } from "./storage.server";
import { prisma } from "~/db.server";

async function convertToReadable(blob: Blob): Promise<Readable> {
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

export async function addGifToVideo({
  video,
  videoId,
  name
}: {
  video: File;
  videoId: string;
  name: string;
}) {
  const key = uuidv4();
  const extension = video.name.split(".")[1];
  const videoPath = join(tmpdir(), `${name}-${key}.${extension}`);
  const gifPath = join(tmpdir(), `${name}-${key}.gif`);
  const readableVideo = await convertToReadable(video);
  await writeFile(videoPath, readableVideo);
  const cleanUp = async () => {
    await unlink(videoPath);
    await unlink(gifPath);
  };

  ffmpeg(videoPath)
    .outputOption("-vf", "scale=320:-1:flags=lanczos,fps=15")
    .save(gifPath)
    .on("end", async () => {
      const gif = await readFile(gifPath);
      const gifFile = new File([gif], `${name}.gif`, { type: "image/gif" });
      const uploadResponse = await uploadHandler({
        filename: name,
        data: gifFile,
        contentType: "image/gif",
        prefix: "gif"
      });
      const parseResponse = FileUploadResponseSchema.safeParse(
        JSON.parse(uploadResponse)
      );
      if (!parseResponse.success) {
        throw new Error("Failed to upload gif");
      }
      await prisma.video.update({
        where: {
          id: videoId
        },
        data: {
          gifUrl: `https://dactylo.io/${parseResponse.data.filename}`
        }
      });
      await cleanUp();
    })
    .on("error", async (err) => {
      console.log(err);
      await cleanUp();
      throw new Error("Failed to convert video to gif");
    });
}

// Function to convert File to GIF
export const convertVideoToGif = async (videoStream: File) => {
  const readableFile = await convertToReadable(videoStream);
  const gifPath = "/path/to/output.gif"; // Define the output path for the GIF

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(readableFile)
      .outputOptions("-vf", "fps=10", "-s", "320x240") // Example options: 10 fps, size 320x240
      .toFormat("gif")
      .save(gifPath)
      .on("end", () => resolve(gifPath))
      .on("error", (err) => reject(err));
  });
};
