import { v4 as uuidv4 } from "uuid";
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
  contentType,
  prefix = "sign"
}: {
  filename?: string;
  contentType: string;
  data: File;
  prefix?: string;
}) => {
  if (!filename) {
    return "no filename";
  }
  const sanatizedFileName = generateFileName(filename, prefix);
  const upload = await uploadStreamToSpaces(
    data,
    sanatizedFileName,
    contentType
  );
  if (upload.$metadata.httpStatusCode === 200) {
    return JSON.stringify({
      filename: sanatizedFileName,
      url: upload.Location,
      errors: []
    });
  }

  return JSON.stringify({ errors: ["Upload failed"] });
};

function sanitizeWord(word: string) {
  // Converts to lowercase
  // Replace spaces with underscores
  // Removes special characters except for underscore
  let sanitizedWord = word.toLowerCase();
  sanitizedWord = sanitizedWord.replace(/\s+/g, "_");
  sanitizedWord = sanitizedWord.replace(/[^a-z0-9_]/g, "");
  return sanitizedWord;
}

function generateFileName(word: string, prefix: string) {
  const now = new Date();
  const dateString = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(
    2,
    "0"
  )}${String(now.getMinutes()).padStart(2, "0")}${String(
    now.getSeconds()
  ).padStart(2, "0")}`;
  const id = uuidv4();
  const sanitizedWord = sanitizeWord(word);

  return `${prefix}-${sanitizedWord}-${id}-${dateString}`;
}
