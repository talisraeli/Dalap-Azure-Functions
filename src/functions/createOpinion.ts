import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import db from "../utils/database";
import IOpinionResponse from "../models/IOpinionResponse";
import authorize from "../utils/authorize";

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

    if (dto.content === undefined) {
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
  } catch (error) {
    return {
      status: 400,
      jsonBody: { error: "Request body isn't defined." },
    };
  }

  try {
    // Authorizes the user.
    const user = await authorize(request);

    if (!user) {
      return {
        status: 401,
        jsonBody: { error: "User not authorized." },
      };
    }

    try {
      // Creating the opinion
      const opinion = await db.opinions.create({
        author: user._id,
        content: dto.content,
        colorHue: Math.floor(Math.random() * 360),
        ["votes.agree"]: [user._id],
      });

      // Returning the result.
      const result: IOpinionResponse = {
        id: opinion._id.toHexString(),
        createdAt: opinion._id.getTimestamp(),
        content: opinion.content,
        colorHue: opinion.colorHue,
        votes: {
          agree: 1,
          disagree: 0,
        },
      };
      return {
        status: 201,
        jsonBody: result,
      };
    } catch (error) {
      return {
        status: 500,
        jsonBody: {
          error: "An unexpected error occurred while processing your request.",
        },
      };
    }
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
