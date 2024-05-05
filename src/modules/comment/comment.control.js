import communitiesModle from "../../../db/modle/community.modle.js";
import postModle from "../../../db/modle/post.modle.js";
import userModle from "../../../db/modle/User.modle.js";
import commentModle from "../../../db/modle/comment.modle.js";
import mongoose from "mongoose";
import adminModel from "../../../db/modle/admin.modle.js";

export const createComment = async (req, res) => {
  const content = req.body;
  const { community, post, id } = req.params;
  const communityFound = await communitiesModle.findOne(
    { community_name: community },
    {}
  );
  if (!communityFound) {
    return res.status(401).json({ msg: "this community does not exist" });
  }

  const postID = new mongoose.Types.ObjectId(post);
  const postFound = await postModle.findOne({ _id: postID }, {});
  console.log(postFound);
  if (!postFound) {
    return res.status(401).json({ msg: "Invalid post" });
  }

  const idFound = await userModle.findOne({ email: id }, {});
  if (!idFound) {
    return res.status(401).json({ msg: "this user does not exist" });
  }

  console.log(idFound.firstName + " " + idFound.lastName);
  // 
  // 
  const newComment = await commentModle.create({
    user_email: id,
    post_id: postID,
    user_name: idFound.firstName + " " + idFound.lastName,
    content: content.content,
  });
  console.log("nvbhv");
  return res.status(200).json({ msg: "this comment created successfully" });
};
export const viewComment = async (req, res) => {
  const content = req.body;
  const { community, post } = req.params;
  const communityFound = await communitiesModle.findOne(
    { community_name: community },
    {}
  );
  if (!communityFound) {
    return res.status(401).json({ msg: "this community does not exist" });
  }

  const postID = new mongoose.Types.ObjectId(post);
  const postFound = await postModle.findOne({ _id: postID }, {});
  if (!postFound) {
    return res.status(401).json({ msg: "Invalid post" });
  }

  const posts = await commentModle.find(
    {
      post_id: postID,
    },
    {}
  );
  return res.status(200).json(posts);
};
export const deleteComment = async (req, res) => {
  try {
    const { community, post, id, commentId } = req.params;

    const communityFound = await communitiesModle.findOne({
      community_name: community,
    });
    if (!communityFound) {
      return res.status(401).json({ msg: "This community does not exist" });
    }

    const postID = new mongoose.Types.ObjectId(post);
    const postFound = await postModle.findOne({ _id: postID });
    if (!postFound) {
      return res.status(401).json({ msg: "Invalid post" });
    }

    const userFound = await userModle.findOne({ email: id });
    if (!userFound) {
      return res.status(401).json({ msg: "This user does not exist" });
    }

    const commentFound = await commentModle.findOne({
      _id: commentId,
      user_email: id,
    });
    if (!commentFound) {
      return res
        .status(404)
        .json({ msg: "Comment not found or user is not the owner" });
    }

    // If the code reaches here, the user is the owner of the comment
    await commentModle.deleteOne({ _id: commentId });

    return res.status(200).json({ msg: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};
export const deleteCommentAdmin = async (req, res) => {
  try {
    const { community, post, id, commentId } = req.params;

    const communityFound = await communitiesModle.findOne({
      community_name: community,
    });
    if (!communityFound) {
      return res.status(401).json({ msg: "This community does not exist" });
    }

    const postID = new mongoose.Types.ObjectId(post);
    const postFound = await postModle.findOne({ _id: postID });
    if (!postFound) {
      return res.status(401).json({ msg: "Invalid post" });
    }

    const userFound = await adminModel.findOne({ email: id });
    if (!userFound) {
      return res.status(401).json({ msg: "This user does not exist" });
    }

    const commentFound = await commentModle.findOne({
      _id: commentId,
      user_email: id,
    });
    if (!commentFound) {
      return res
        .status(404)
        .json({ msg: "Comment not found or user is not the owner" });
    }

    // If the code reaches here, the user is the owner of the comment
    await commentModle.deleteOne({ _id: commentId });

    return res.status(200).json({ msg: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};