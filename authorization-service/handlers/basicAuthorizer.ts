import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import { createPolicy } from "../utils/helpers";
import * as dotenv from "dotenv";

dotenv.config();

export const handler = (
  event: APIGatewayTokenAuthorizerEvent,
  _context: any,
  callback: any,
) => {
  console.log("Basic Authorizer Event:", event);
  console.log("Token:", event.authorizationToken);

  try {
    if (!event.authorizationToken) {
      callback("Unauthorized");
    }
    const authToken = event.authorizationToken;

    const encodedCreds = authToken.split(" ")[1];

    if (!encodedCreds) {
      callback("Token is not provided");
    }

    const buff = Buffer.from(encodedCreds, "base64");
    const [username, password] = buff.toString("utf-8").split(":");
    console.log("Username:", username);
    console.log("Password:", password);
    const storedUserPassword = process.env[username];

    const effect =
      !storedUserPassword || storedUserPassword !== password ? "Deny" : "Allow";

    console.log("Effect:", effect);

    const policy = createPolicy(username, effect, event.methodArn);

    return callback(null, policy);
  } catch (error) {
    return callback("Unauthorized:", (error as Error).message);
  }
};
