import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import * as dotenv from "dotenv";
import { createPolicy } from "../utils/helpers";

dotenv.config();

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent,
  _context: any,
  callback: any,
): Promise<APIGatewayAuthorizerResult> => {
  console.log("Basic Authorizer Event:", event);

  try {
    if (!event.authorizationToken) {
      callback("Token is missing", null);
    }
    const authToken = event.authorizationToken;

    const encodedCreds = authToken.split(" ")[1];
    const buff = Buffer.from(encodedCreds, "base64").toString("utf-8");
    const [username, password] = buff.split(":");

    const storedUserPassword = process.env[username];

    const effect =
      !storedUserPassword || storedUserPassword !== password ? "Deny" : "Allow";

    const policy = createPolicy(username, effect, event.methodArn);

    return callback(null, policy);
  } catch (error) {
    console.error(error);

    return callback("Unauthorized", error);
  }
};
