import mongoose, { Schema, model } from "mongoose";
const adminSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
    min: 2,
    max: 50,
    match: [/^[A-Za-z]+$/, "First name should contain only letters"],
  },

  last_name: {
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
  phone: {
    type: String,
  },
  pio: {
    type: String,
  },
  created_by: {
    type: String,
  },
  disabled_by: {
    type: String,
  },
  address: {
    type: String,
  },
  community_id: {
    type: String,
    require: true,
  },
  birth_date: {
    type: Date,
  },
  created_date: {
    type: Date,
    required: true,
    default: new Date(),
  },
  image: {
    type: Object,
    default: null,

  },
});
const adminModel = mongoose.models.Admin || model("Admin", adminSchema);
export default adminModel;