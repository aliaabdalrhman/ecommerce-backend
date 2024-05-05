import mongoose, { Schema, model, Types } from "mongoose";
const PostSchema = new mongoose.Schema(
  {
    user_email: {
      type: String,
      required: [true, "Uer email is required"],
    },
    user_name: {
      type: String,
      required: [true, "Uer email is required"],
    },
    community_name: {
      type: String,
      required: [true, "Community name is required"],
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    //like:{type:Number,default:0,},
    post_type: {
      type: String,
      enum: ["owner", "customer"],
      required: [true, "type is required"],
    },
    Images: [
      {
        type: Object,
        // required: [true, "sup Images is required"],
      },
    ],
    properties: [{}],
  },
  {
    timestamps: true,
  }
);

const postModel = mongoose.models.Post || model("Post", PostSchema);
export default postModel;