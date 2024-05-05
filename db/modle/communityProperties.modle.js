import mongoose, { Schema, model, Types } from "mongoose";
const communityPropertiesSchema = new mongoose.Schema({
  community_Name: {
    type: String,
    required: [true, "Community name is required"],
  },
  property: {
    type: String,
    required: [true, "Property  is required"],
  },
  value: {
    type: String,
    required: [true, "Value is required"],
  },
  customer_fill: {
    type: Boolean,
    required: [true, "Customer fill is required"],
  },
  owner_fill: {
    type: Boolean,
    required: [true, "Owner Fill is required"],
  },
});
const communityPropertiesSchemaModel =
  mongoose.models.communityProperties ||
  model("communityProperties", communityPropertiesSchema);
export default communityPropertiesSchemaModel;
