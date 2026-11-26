import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGOOSE_URI);
    console.log("Database connected");
  } catch (error) {
    console.log("Database connection failure");
    process.exit(1); // fail-safe
  }
};

export default connectDB;
