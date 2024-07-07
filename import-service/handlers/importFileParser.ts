import { S3Event, S3Handler } from "aws-lambda";
import { createResponse } from "../utils/createResponse";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import csv from "csv-parser";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const awsRegion = "eu-west-1";
const s3Client = new S3Client({ region: awsRegion });
const sqsClient = new SQSClient({ region: awsRegion });

export const handler: S3Handler = async (event: S3Event): Promise<any> => {
  try {
    console.log("Import File Parser Event:", event);

    const {
      bucket: { name },
      object: { key },
    } = event.Records[0].s3;

    const fileName = decodeURIComponent(key.replace(/\+/g, " "));

    const params = {
      Bucket: name,
      Key: fileName,
    };

    const copyParams = {
      Bucket: name,
      CopySource: `${name}/${fileName}`,
      Key: fileName.replace("uploaded/", "parsed/"),
    };

    const getCommand = new GetObjectCommand(params);
    const { Body } = await s3Client.send(getCommand);

    const parseStream = (Body as Readable).pipe(csv());

    const copyCommand = new CopyObjectCommand(copyParams);

    const deleteCommand = new DeleteObjectCommand(params);

    await new Promise((res, rej) => {
      parseStream.on("data", async (data) => {
        console.log("Sending message...");

        await sqsClient.send(
          new SendMessageCommand({
            QueueUrl:
              "https://sqs.eu-west-1.amazonaws.com/992382621053/importItemsQueue",
            MessageBody: JSON.stringify(data),
          }),
        );

        console.log("Parsed data:", data);
      });
      parseStream.on("end", async () => {
        await s3Client.send(copyCommand);
        await s3Client.send(deleteCommand);
        res(true);
      });
      parseStream.on("error", (err) => rej(err));
    });

    console.log("File moved and deleted.");
  } catch (error) {
    console.error("Error parsing CSV", error);
    return createResponse(500, { message: "Internal Server Error" });
  }
};
