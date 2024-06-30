import { APIGatewayProxyHandler } from "aws-lambda"
import { createResponse } from "../utils/createResponse";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { error } from "console";

const BUCKET_NAME = process.env.BUCKET_NAME;
const UPLOADED_FOLDER = process.env.UPLOADED_FOLDER;
const AWS_REGION = process.env.AWS_REGION
const s3Client = new S3Client({ region: AWS_REGION });

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Import Product File Event:', event);

    const { name: fileName } = event.queryStringParameters || {};
    const Key = `${UPLOADED_FOLDER}${fileName}`;
    const params = {
      Bucket: BUCKET_NAME,
      Key,
      ContentType: 'text/csv',
    };
  
    if (!fileName) {
      return createResponse(400, {
        message: 'No file name'
      })
    }

    const command = new PutObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, {expiresIn: 60})

    console.log('Signed URL has been generated:', signedUrl)

    return createResponse(200, {url: signedUrl})
  } catch {
    console.error('Error creating signed URL', error);
    return createResponse(500, {message: 'Internal Server Error'})
  }
}