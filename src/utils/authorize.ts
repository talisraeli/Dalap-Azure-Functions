import { HttpRequest } from "@azure/functions";
import db from "./database";
import { parseCookies } from "./parseCookies";

/**
 * Authorizes a user by reading the request headers.
 * @param request The HTTP request.
 * @returns The authorized user if succeed, else undefined.
 */
export default async function authorize(request: HttpRequest) {
  if (!request.headers.has("cookie")) {
    return undefined;
  }

  const cookies = parseCookies(request.headers.get("cookie"));
  const token = cookies.token;

  if (token === undefined) {
    return undefined;
  }

  const user = await db.users.findOne({ token: decodeURIComponent(token) });

  return user;
}
