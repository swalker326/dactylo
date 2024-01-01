import { S3Client } from "@aws-sdk/client-s3";

import { Upload } from "@aws-sdk/lib-storage";
import { z } from "zod";

export const FileUploadResponseSchema = z.object({
  filename: z.string(),
  url: z.string()
});

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
  stream: File,
  filename: string,
  contentType: string
) {
  return new Upload({
    client: storage,
    leavePartsOnError: false,
    params: {
      Bucket: "dact",
      Key: filename,
      Body: stream,
      ContentType: contentType
    }
  }).done();
}

export const uploadHandler = async ({
  data,
  filename,
  contentType
}: {
  data: File;
  filename: string;
  contentType: string;
}) => {
  const pathExtension = contentType.split("/")[1];
  const videoUrl = `https://media.dactylo.io/${filename}.${pathExtension}`;

  const upload = await uploadStreamToSpaces(
    data,
    `${filename}.${pathExtension}`,
    contentType
  );
  if (upload.$metadata.httpStatusCode === 200) {
    return {
      url: videoUrl,
      errors: []
    };
  }

  return { errors: ["Upload failed"] };
};
