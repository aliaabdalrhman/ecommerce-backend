import mongoose, { Schema, model } from "mongoose";
// const ObjectID =
const commentSchema = new mongoose.Schema({
    post_id: {
        type: mongoose.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    user_email: {
        type: String,
        ref: 'User',
        // required: true,
    },
    user_name: {
        type: String,
        // required: [true, "Uer email is required"],
    },
    content: {
        type: String,
        required: true
    },
}, {
    timestamps: true
}
);

const commentModel = mongoose.models.Comment || model("Comment", commentSchema);
export default commentModel;