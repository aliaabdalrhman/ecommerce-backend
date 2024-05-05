import {mongoose} from "mongoose";

const connectdb = async () => {
  try {
    await mongoose.connect(process.env.DB);
    console.log("Database connected successfully");
  } catch (error) {
    console.error(error);
    // handle the error as needed
  }
};
export default connectdb;