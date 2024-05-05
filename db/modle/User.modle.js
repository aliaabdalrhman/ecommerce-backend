import mongoose, { Schema, model } from "mongoose";
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      min: 2,
      max: 50,
      match: [/^[A-Za-z]+$/, "First name should contain only letters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      min: 2,
      max: 50,
      match: [/^[A-Za-z]+$/, "last name should contain only letters"],
    },

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

    confirmEmail: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
    },
    bio: {
      type: String,
    },
    admin_email: {
      type: String,
    },
    birth_date: {
      type: Date,
    },
    address: {
      type: String,
    },

    image: {
      type: Object,
      default: null,

    },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.models.User || model("User", userSchema);
export default userModel;
