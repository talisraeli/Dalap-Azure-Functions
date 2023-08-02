import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import db from "../utils/database";
import getClientIp from "../utils/getClientIp";

/**
 * The request body for POST method in route "opinions/create".
 */
interface ICreateOpinionRequestBody {
  content: string;
}

export async function createOpinion(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  let dto: ICreateOpinionRequestBody;

  try {
    // Reading request body
    dto = (await request.json()) as ICreateOpinionRequestBody;
  } catch (error) {
    return {
      status: 400,
      jsonBody: { error: "Request body isn't defined." },
    };
  }

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

  if (!dto.content) {
    return {
      status: 400,
      jsonBody: { error: "Field 'content' isn't defined." },
    };
  }

  // Regex validator for the request's body content.
  // Checking for 8-128 length sentence; Hebrew, English, digits, or whitespace chars;
  // and no more than two following whitespaces.
  const contentValudator = /(?!.*\s{2,}.*)^[a-zA-Zא-ת\d ]{8,128}$/g;

  if (!contentValudator.test(dto.content)) {
    return {
      status: 400,
      jsonBody: { error: "Field 'content' isn't valid." },
    };
  }

  try {
    // Creating the opinion
    const opinion = await db.opinions.create({
      content: dto.content,
      colorHue: Math.floor(Math.random() * 360),
      ["votes.agree"]: [ip],
    });
    return {
      status: 201,
      jsonBody: opinion,
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

app.http("createOpinion", {
  route: "opinions/create",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: createOpinion,
});
