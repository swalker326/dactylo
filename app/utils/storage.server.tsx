import { S3Client } from "@aws-sdk/client-s3";

import { Upload } from "@aws-sdk/lib-storage";
import type { UploadHandler } from "@remix-run/node";

const { STORAGE_ACCESS_KEY, STORAGE_SECRET, STORAGE_ENDPOINT } = process.env;

if (!STORAGE_ENDPOINT) {
  throw new Error(`Storage is missing required configuration.`);
}

if (!STORAGE_ACCESS_KEY) {
  throw new Error(`Storage is missing required configuration.`);
}

if (!STORAGE_SECRET) {
  throw new Error(`Storage is missing required configuration.`);
}

const storage = new S3Client({
  endpoint: STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: STORAGE_ACCESS_KEY,
    secretAccessKey: STORAGE_SECRET
  },

  // This is only needed for the AWS SDK and it must be set to their region
  region: "us-east-1"
});

export async function uploadStreamToSpaces(
  //TODO: figure out what type this actually is
  stream: ReadableStream<any>,
  filename: string
) {
  return new Upload({
    client: storage,
    leavePartsOnError: false,
    params: {
      Bucket: "dact",
      Key: filename,
      Body: stream
    }
  }).done();
}
async function* generateChunks(asyncIterable: AsyncIterable<Uint8Array>) {
  for await (const chunk of asyncIterable) {
    yield chunk;
  }
}

export const uploadHandler: UploadHandler = async ({ data, filename }) => {
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of generateChunks(data)) {
        controller.enqueue(chunk);
      }
      controller.close();
    }
  });
  if (!filename) {
    return "no filename";
  }

  const upload = await uploadStreamToSpaces(readableStream, filename);
  console.log(upload);
  if (upload.$metadata.httpStatusCode === 200) {
    return JSON.stringify({ filename, url: upload.Location });
  }

  return "error uploading file";
};
