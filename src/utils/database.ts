import { Schema, createConnection, ConnectOptions } from "mongoose";
import { IOpinion } from "../models/IOpinion";
import "dotenv/config";

/**
 * The connection to the database.
 */
const connection = createConnection(process.env.MONGO_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
} as ConnectOptions);

/**
 * The database scheme of {@link IOpinion}
 */
const opinionSchema = new Schema<IOpinion>({
  content: { type: String, required: true },
  colorHue: {
    type: Number,
    default: Math.floor(Math.random() * 360),
  },
  votes: {
    agree: [String],
    disagree: [String],
  },
});

/**
 * The opinions model on the database.
 */
const opinions = connection.model<IOpinion>("Opinion", opinionSchema);

export default { opinions };
