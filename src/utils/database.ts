import mongoose, { Schema, createConnection, ConnectOptions } from "mongoose";
import { IOpinion } from "../models/IOpinion";
import IUser from "../models/IUser";

/**
 * The connection to the database.
 */
const connection = createConnection(process.env["MONGO_CONNECTION_STRING"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as ConnectOptions);

/**
 * The database scheme of {@link IUser}
 */
const userSchema = new Schema<IUser>({
  ip: { type: String, required: true },
  token: String,
});

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
    agree: [{ type: Schema.Types.ObjectId, ref: "User" }],
    disagree: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
});

/**
 * The users model on the database.
 */
const users = connection.model<IUser>("User", userSchema);

/**
 * The opinions model on the database.
 */
const opinions = connection.model<IOpinion>("Opinion", opinionSchema);

export default { users, opinions };
