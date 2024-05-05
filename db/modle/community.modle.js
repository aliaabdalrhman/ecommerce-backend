// community.modle.js
import mongoose, { Schema, Types } from "mongoose";
const communitySchema = new Schema(
  {
    community_name: {
      type: String,
      required: [true, "Community name is required"],
      unique: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    image: {
      type: Object,
      required: [true, "Image is required"],
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "InActive"],
    },
    createdBy: { type: Types.ObjectId, ref: "SuperAdmin" },
    updatedBy: { type: Types.ObjectId, ref: "SuperAdmin" },
  },
  {
    timestamps: true,
  }
);
const Community = mongoose.model("Community", communitySchema);
export default Community;

