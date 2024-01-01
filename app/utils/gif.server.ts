import ffmpeg from "fluent-ffmpeg";
import { tmpdir } from "os";
import { unlink, writeFile, readFile } from "fs/promises";
import { join } from "path";
import { uploadHandler } from "./storage.server";
import { convertToReadable } from "./video.server";

export async function uploadThumbnail({
  video,
  key,
  name
}: {
  video: File;
  key: string;
  name: string;
}): Promise<{ thumbnailUrl: string }> {
  const videoPath = join(tmpdir(), `${name}.${video.name.split(".")[1]}`);
  const thumbnailPath = join(tmpdir(), `${name}-${key}.jpg`);
  const readableVideo = await convertToReadable(video);
  await writeFile(videoPath, readableVideo);

  const cleanUp = async () => {
    await unlink(videoPath);
    await unlink(thumbnailPath);
  };

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOption("-ss", "00:00:01")
      .outputOption("-frames:v", "1")
      .outputOption("-s", "120x68")
      .outputOption("-f", "image2")
      .save(thumbnailPath)
      .on("end", async () => {
        const thumbnail = await readFile(thumbnailPath);
        const { url } = await uploadHandler({
          filename: name,
          data: new File([thumbnail], `${name}.jpg`, { type: "image/jpeg" }),
          contentType: "image/jpeg"
        });
        if (!url) {
          throw new Error("Failed to upload thumbnail");
        }

        resolve({
          thumbnailUrl: url
        });
        await cleanUp();
      })
      .on("error", (err) => reject(err));
  });
  //ffmpeg -i test.mp4 -ss 00:00:01 -frames:v 1 -s 120x68 -f image2 output_placeholder.jpg
}
