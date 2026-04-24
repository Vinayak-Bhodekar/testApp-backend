import mongoose from "mongoose";
import { DB_NAME } from "../constraints.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`MongoDB connected ! DB host : ${conn.connection.host}`);
  } catch (error) {
    console.log("mongoDB connection error: ",error);
    process.exit(1);
  }
}

export default connectDB;