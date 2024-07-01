import { APIGatewayProxyHandler } from "aws-lambda";
import { createResponse } from "../utils/createResponse";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { error } from "console";

const BUCKET_NAME = "my-import-csv-bucket";
const UPLOADED_FOLDER = "uploaded/";
const awsRegion = "eu-west-1";
const s3Client = new S3Client({ region: awsRegion });

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log("Import Product File Event:", event);

    const { name: fileName } = event.queryStringParameters || {};
    const Key = `${UPLOADED_FOLDER}${fileName}`;
    const params = {
      Bucket: BUCKET_NAME,
      Key,
      ContentType: "text/csv",
    };

    if (!fileName) {
      return createResponse(400, {
        message: "No file name",
      });
    }

    const command = new PutObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    console.log("Signed URL has been generated:", signedUrl);

    return createResponse(200, signedUrl);
  } catch {
    console.error("Error creating signed URL", error);
    return createResponse(500, { message: "Internal Server Error" });
  }
};
