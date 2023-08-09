import { HttpRequest } from "@azure/functions";
import db from "./database";

/**
 * Authorizes a user by reading the request headers.
 * @param request The HTTP request.
 * @returns The authorized user if succeed, else undefined.
 */
export default async function authorize(request: HttpRequest) {
  if (!request.headers.has("cookie")) {
    return undefined;
  }

  const token = request.headers.get("cookie").split("=")[1];

  if (token === undefined) {
    return undefined;
  }

  const user = await db.users.findOne({ token: decodeURIComponent(token) });

  return user;
}
