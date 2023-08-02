import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import db from "../utils/database";
import { FilterQuery } from "mongoose";
import { IOpinion } from "../models/IOpinion";
import getClientIp from "../utils/getClientIp";

/**
 * The response body for GET method in route "opinions/get".
 */
interface IGetOpinionResponseBody {
  id: string;
  createdAt: Date;
  content: string;
  colorHue: number;
}

export async function getOpinion(
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
    // Getting all the opinions where the client hasn't voted
    const filter: FilterQuery<IOpinion> = {
      ["votes.agree"]: {
        $ne: ip,
      },
      ["votes.disagree"]: {
        $ne: ip,
      },
    };

    // Checking if there are opinions
    const opinionsCount = await db.opinions.find(filter).count();
    if (opinionsCount === 0) {
      return {
        status: 404,
        jsonBody: {
          error: "No opinion left for you to vote.",
        },
      };
    }

    // Getting a random opinion
    const randomSkipNumber = Math.floor(Math.random() * opinionsCount);
    const opinion = await db.opinions.findOne(filter).skip(randomSkipNumber);

    // Returning the result.
    const result: IGetOpinionResponseBody = {
      id: opinion._id.toHexString(),
      createdAt: opinion._id.getTimestamp(),
      content: opinion.content,
      colorHue: opinion.colorHue,
    };
    return { jsonBody: result };
  } catch (error) {
    return {
      status: 500,
      jsonBody: {
        error: "An unexpected error occurred while processing your request.",
      },
    };
  }
}

app.http("getOpinion", {
  route: "opinions/get",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getOpinion,
});
