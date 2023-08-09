import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import db from "../utils/database";
import { FilterQuery } from "mongoose";
import { IOpinion } from "../models/IOpinion";
import IOpinionResponse from "../models/IOpinionResponse";
import authorize from "../utils/authorize";

export async function getOpinion(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
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
      // Getting all the opinions where the client hasn't voted
      const filter: FilterQuery<IOpinion> = {
        ["votes.agree"]: {
          $ne: user._id,
        },
        ["votes.disagree"]: {
          $ne: user._id,
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
      const opinion = await db.opinions
        .find(filter)
        .skip(randomSkipNumber)
        .findOne();

      // Returning the result.
      const result: IOpinionResponse = {
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
