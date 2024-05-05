import mongoose, { Schema, model } from "mongoose";

const logSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value) => {
        // Update the regular expression based on your requirements
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      error: "Please enter a valid email address",
    },
  },
  role: {
    type: String,
    default: "User",
    enum: ["SuperAdmin", "SubAdmin", "User"],
  },
  state_us: {
    type: Boolean,
    default: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    min: 8,
    max: 20,
  },
  sendCode: {
    type: String,
    default: null,
  },
});
const logModel = mongoose.models.Log || model("Log", logSchema);
export default logModel;