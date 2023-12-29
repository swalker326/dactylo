import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";
import { tmpdir } from "os";
import { unlink, writeFile, readFile } from "fs/promises";
import { join } from "path";
import { FileUploadResponseSchema, uploadHandler } from "./storage.server";

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
export async function generatePlaceholderImage(
  videoPath: string,
  key: string,
  name: string
) {
  const placeholderPath = join(tmpdir(), `${name}-${key}.jpg`);
  new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOption("-ss", "00:00:01")
      .outputOption("-frames:v", "1")
      .outputOption("-s", "120x68")
      .outputOption("-f", "image2")
      .save(placeholderPath)
      .on("end", async () => {
        const placeholder = await readFile(placeholderPath);
        uploadHandler({
          filename: name,
          data: new File([placeholder], `${name}.jpg`, { type: "image/jpeg" }),
          contentType: "image/jpeg",
          prefix: "placeholder",
          key: key
        });
        resolve(null);
      })
      .on("error", (err) => reject(err));
  });
  //ffmpeg -i test.mp4 -ss 00:00:01 -frames:v 1 -s 120x68 -f image2 output_placeholder.jpg
}
export async function uploadGif({
  video,
  name,
  key
}: {
  video: File;
  name: string;
  key: string;
}): Promise<{ gifUrl: string }> {
  const extension = video.name.split(".")[1];
  const videoPath = join(tmpdir(), `${name}-${key}.${extension}`);
  const gifPath = join(tmpdir(), `${name}-${key}.gif`);
  const readableVideo = await convertToReadable(video);
  await writeFile(videoPath, readableVideo);

  const cleanUp = async () => {
    await unlink(videoPath);
    await unlink(gifPath);
  };
  await generatePlaceholderImage(videoPath, key, name);

  // Wrap FFmpeg conversion in a Promise
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOption(
        "-filter_complex",
        "[0:v] fps=12,scale=480:-1,split [a][b];[a] palettegen [p];[b][p] paletteuse"
      )
      .save(gifPath)
      .on("end", async () => {
        try {
          const gif = await readFile(gifPath);
          const gifFile = new File([gif], `${name}.gif`, { type: "image/gif" });
          const uploadResponse = await uploadHandler({
            filename: name,
            data: gifFile,
            contentType: "image/gif",
            prefix: "gif",
            key: key
          });
          const parseResponse = FileUploadResponseSchema.safeParse(
            JSON.parse(uploadResponse)
          );
          if (!parseResponse.success) {
            throw new Error("Failed to upload gif");
          }

          await cleanUp();
          resolve({
            gifUrl: `https://media.dactylo.io/${parseResponse.data.filename}`
          });
        } catch (error) {
          await cleanUp();
          reject(error);
        }
      })
      .on("error", async (err) => {
        console.log(err);
        await cleanUp();
        reject(new Error("Failed to convert video to gif"));
      });
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
