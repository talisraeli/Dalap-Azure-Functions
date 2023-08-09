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
 * The request body for POST method in route "opinions/vote/{id}".
 */
interface IVoteOpinionRequestBody {
  isAgree: boolean;
}

export async function voteOpinion(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  let dto: IVoteOpinionRequestBody;

  try {
    // Reading request body
    dto = (await request.json()) as IVoteOpinionRequestBody;

    if (dto.isAgree === undefined) {
      return {
        status: 400,
        jsonBody: { error: "Request field 'isAgree' isn't defined." },
      };
    }
  } catch (error) {
    return {
      status: 400,
      jsonBody: { error: "Request body isn't defined." },
    };
  }

  let id: string;

  try {
    // Reading path params
    id = request.params.id;
    const idRegex = /^[a-f\d]{24}$/gi;
    if (!idRegex.test(id)) {
      return {
        status: 400,
        jsonBody: { error: "Opinion ID isn't valid." },
      };
    }
  } catch (error) {
    return {
      status: 400,
      jsonBody: { error: "Opinion ID isn't defined." },
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
      // Validating if the client already voted for this opinion.
      const opinion = await db.opinions.findById(id);
      if (
        opinion.votes.agree.includes(user._id) ||
        opinion.votes.disagree.includes(user._id)
      ) {
        return {
          status: 400,
          jsonBody: {
            error: "You already voted for this opinion.",
          },
        };
      }

      // Adding a new vote to the opinion
      const modifiedOpinion = await db.opinions.findByIdAndUpdate(
        id,
        {
          $push: {
            [`votes.${dto.isAgree ? "agree" : "disagree"}`]: user._id,
          },
        },
        { new: true }
      );

      // Returning the result.
      const result: IOpinionResponse = {
        id: modifiedOpinion._id.toHexString(),
        createdAt: modifiedOpinion._id.getTimestamp(),
        content: modifiedOpinion.content,
        colorHue: modifiedOpinion.colorHue,
        votes: {
          agree: await modifiedOpinion.votes.agree.length,
          disagree: await modifiedOpinion.votes.disagree.length,
        },
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

app.http("voteOpinion", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: voteOpinion,
  route: "opinions/vote/{id}",
});
