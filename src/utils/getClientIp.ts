import { HttpRequest } from "@azure/functions";

/**
 *
 * @param request The HTTP request.
 * @returns The IP of the client as string.
 */
export default function getClientIp(request: HttpRequest) {
  if (request.headers.has("x-forwarded-for")) {
    return request.headers.get("x-forwarded-for").split(",")[0].split(":")[0];
  }

  throw new Error("Request headers are missing 'x-forwarded-for' header key.");
}
