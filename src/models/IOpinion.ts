import { Types } from "mongoose";

/**
 * The opinion base model interface
 */
export interface IOpinion {
  author: Types.ObjectId;
  content: string;
  colorHue: number;
  votes: {
    agree: Types.ObjectId[];
    disagree: Types.ObjectId[];
  };
}
