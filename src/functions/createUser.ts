import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import db from "../utils/database";
import { randomBytes } from "crypto";

export async function createUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  let ip: string;
  try {
    // Reading client IP
    ip = getClientIp(request);
  } catch (error) {
    return {
      status: 400,
      jsonBody: { error: "Couldn't parse your IP address." },
    };
  }

  try {
    // Creating the user
    const user = await db.users.create({
      ip: ip,
      token: generateToken(),
    });

    // Returning the result
    return {
      status: 201,
      cookies: [
        {
          name: "token",
          value: user.token,
          maxAge: 60 * 60 * 24 * 365 * 10, // 10 years,
          sameSite: "Strict",
          path: "/",
          domain:
            process.env["PROFILE"] === "development"
              ? ".localhost"
              : ".דלפ.ישראל",
          secure: true,
          httpOnly: true,
        },
      ],
    };
  } catch (error) {
    return {
      status: 500,
      jsonBody: {
        error: "An unexpected error occurred while processing your request.",
      },
    };
  }
}

/**
 * Get the IP address of the client.
 * @param request The HTTP request.
 * @returns The IP of the client as string.
 */
function getClientIp(request: HttpRequest) {
  if (request.headers.has("x-forwarded-for")) {
    return request.headers.get("x-forwarded-for").split(",")[0].split(":")[0];
  }

  throw new Error("Request headers are missing 'x-forwarded-for' header key.");
}

/**
 * Generates a 256-bit token.
 * @returns Base-64 formmated 256-bit token string.
 */
function generateToken() {
  return randomBytes(32).toString("base64");
}

app.http("createUser", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: createUser,
  route: "users/create",
});
