import communityProperities from "../../../db/modle/communityProperties.modle.js";
import communities from "../../../db/modle/community.modle.js";
import post from "../../../db/modle/post.modle.js";
import user from "../../../db/modle/User.modle.js";
import admin from "../../../db/modle/admin.modle.js";
import commentModle from "../../../db/modle/comment.modle.js";
import cloudinary from "../../services/cloudinary.js";
export const postView = async (req, res) => {
  try {
    const communityParams = req.params;
    const communityName = communityParams.community; // This should be a string
    const found = await communities.findOne({ community_name: communityName });
    if (!found) {
      return res.status(404).send({ msg: "Community not found" });
    }
    const properties = await communityProperities.find(
      { community_Name: communityName },
      { _id: 0, __v: 0 }
    );
    if (!properties) {
      return res.status(404).send({ msg: "No found community" });
    }
    if (properties.length === 0) {
      return res.status(404).send({ msg: "No properties found for community" });
    }
    return res.status(200).send(properties);
  } catch (err) {
    res.status(500).send({ msg: "Error retrieving properties" });
  }
};

// export const viewPosts = async (req, res) => {
//     try {
//         const communityParams = req.params;
//         const communityName = communityParams.community;
//         const found = await communities.findOne({ community_name: communityName });
//         if (!found) {
//             return res.status(404).send({ msg: 'Community not found' });
//         }
//         try {
//             const posts = await post.find({ community_name: communityName }, {});
//             if (!posts || posts.length === 0) {
//                 return res.status(404).send('No posts found for community');
//             }
//             return res.status(201).send(posts);
//         } catch (err) {
//             return res.status(500).send('Error retrieving posts');
//         }
//     } catch (err) {
//         return res.status(500).send({ msg: 'Error retrieving properties' });
//     }
// };
////////////////////////////////////////////////////////////////////////////////////
// export const createPosts = async (req, res) => {
//   try {
//     const { community, id } = req.params;
//     const foundCommunity = await communities.findOne({ community_name: community });
//     const foundID = await user.findOne({ email: id });

//     if (!foundCommunity) {
//       return res.status(404).send({ msg: 'Community not found' });
//     }

//     if (!foundID) {
//       return res.status(404).send({ msg: 'Email not found' });
//     }

//     const { type } = req.body;
//     const mainImage = req.files.mainImage[0]; // Assuming mainImage is a single image
//     const supImages = req.files.supImages || []; // Assuming supImages is an array of images

//     // Upload main image to Cloudinary
//     const mainImageResult = await cloudinary.uploader.upload(mainImage.path, {
//       folder: `${process.env.APP_NAME}/post`,
//     });

//     // Upload supplementary images to Cloudinary
//     const supImagesResults = await Promise.all(
//       supImages.map(async (supImage) => {
//         return cloudinary.uploader.upload(supImage.path, {
//           folder: `${process.env.APP_NAME}/post`,
//         });
//       })
//     );

//     // Create post with image URLs
//     const newPost = await post.create({
//       user_email: id,
//       community_name: community,
//       postType: type,
//       like: 0,
//       properties: {
//         mainImage: mainImageResult.secure_url,
//         supImages: supImagesResults.map((result) => result.secure_url),
//       },
//     });

//     newPost.save();
//     return res.status(201).send({ msg: "Created successfully :)", newPost });
//   } catch (err) {
//     console.error('Error:', err);
//     return res.status(500).send({ msg: 'Internal Server Error' });
//   }
// };
export const deletePost = async (req, res) => {
  try {
    const { community, id, postId } = req.params;
    const foundCommunity = await post.findOne({ community_name: community });
    const foundID = await user.findOne({ email: id });
    if (!foundCommunity) {
      return res.status(404).send({ msg: "Community not found" });
    }
    if (!foundID) {
      return res.status(404).send({ msg: "Email not found" });
    }
    // delete comments
    const deleteComments = await commentModle.deleteMany({ post_id: postId });
    // delete post
    const deletedPost = await post.findOneAndDelete({
      _id: postId,
      user_email: id,
      community_name: community,
    });
    if (!deletedPost) {
      return res.status(404).send({ msg: "Post not found" });
    }
    return res.status(200).send({ msg: "Post deleted successfully" });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).send({ msg: "Internal Server Error" });
  }
};
export const viewPost = async (req, res) => {
  try {
    const communityParams = req.params;
    const communityName = communityParams.community;
    const foundCommunity = await communities.findOne({ community_name: communityName });

    if (!foundCommunity) {
      return res.status(404).send({ msg: 'Community not found' });
    }

    try {
      const posts = await post.find({ community_name: communityName }).sort({ createdAt: -1 });
      const users = await user.find();

      if (!posts || posts.length === 0) {
        return res.status(404).send('No posts found for community');
      }

      let newArr = [];
      for (let i of posts) {
        let obj = {};
        const userl = await user.findOne({ email: i.user_email });
        const commentsNumber = await commentModle.countDocuments({ post_id: i._id });
        const likeNumber = i.likes.length;

        // Retrieve likes information
        const likesInfo = [];
        for (const userId of i.likes) {
          const likedUser = await user.findById(userId);
          if (likedUser) {
            likesInfo.push({ userId, userEmail: likedUser.email, userImage: likedUser.image });
          }
        }

        // Add user image to post if user is found
        if (userl) {
          i = i.toObject();
          i.userImage = userl.image;
        }

        // Retrieve comments with user images
        let commentsWithImages = [];
        const comments = await commentModle.find({ post_id: i._id });
        for (let comment of comments) {
          const commentUser = await user.findOne({ email: comment.user_email });
          let commentObj = comment.toObject();
          // Add user image to comment if user is found
          if (commentUser) {
            commentObj.userImage = commentUser.image;
          }
          commentsWithImages.push(commentObj);
        }

        obj['postId'] = i._id;
        obj['post'] = i;
        obj['commentsNumber'] = commentsNumber;
        obj['comments'] = commentsWithImages;
        obj['likesNumber'] = likeNumber;
        obj['likesInfo'] = likesInfo;
        newArr.push(obj);
      }
      return res.status(201).send(newArr);
    } catch (err) {
      return res.status(500).send({ msg: 'Error retrieving posts' });
    }
  } catch (err) {
    return res.status(500).send({ msg: 'Error retrieving properties' });
  }
};
export const createPosts = async (req, res) => {
  try {
    const { community, id } = req.params;
    const foundCommunity = await communities.findOne({
      community_name: community,
    });
    const foundID = await user.findOne({ email: id });

    if (!foundCommunity) {
      return res.status(404).send({ msg: "Community not found" });
    }
    if (!foundID) {
      return res.status(404).send({ msg: "Email not found" });
    }

    const { type, input } = req.body;

    // Fetch community properties from the database
    const communityProperties = await communityProperities.find({
      community_Name: community,
    });

    // Function to validate properties and their values against the database
    const validateProperties = (properties) => {
      const missingProperties = [];

      for (const prop of properties) {
        const propertyDetails = communityProperties.find(
          (cp) => cp.property === prop.property
        );

        if (!propertyDetails) {
          return false; // Property details not found in the database
        }

        // Check if type is "customer" and customer_fill is true
        if (type === "customer" && propertyDetails.customer_fill && !prop.value) {
          missingProperties.push(propertyDetails.property);
        }

        // Check if type is "owner" and owner_fill is true
        if (type === "owner" && propertyDetails.owner_fill && !prop.value) {
          missingProperties.push(propertyDetails.property);
        }
      }

      return { isValid: missingProperties.length === 0, missingProperties };
    };

    // Validate properties and their values against the database
    const validationResult = validateProperties(input);

    if (!validationResult.isValid) {
      return res.status(400).send({
        msg: "Invalid property values for the given post type",
        missingProperties: validationResult.missingProperties,
      });
    }
    // Continue with the rest of your code to create the post
    const newPost = await post.create({
      user_email: id,
      user_name: foundID.firstName + " " + foundID.lastName,
      community_name: community,
      post_type: type,
      properties: input,
    });

    newPost.save();
    return res.status(201).send({ msg: "Created successfully :)", post: newPost });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).send({ msg: "Error creating post" });
  }
};
export const addPostImage = async (req, res) => {
  try {
    const postId = req.params.id;
    const existingPost = await post.findById(postId);

    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    const uploadedImages = req.files['Images'];

    if (!uploadedImages) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const imagesArray = [];

    for (const image of uploadedImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        image.path,
        {
          folder: `${process.env.APP_NAME}/posts`,
        }
      );
      imagesArray.push({ secure_url, public_id });
    }

    existingPost.Images = imagesArray;
    await existingPost.save();

    return res.status(201).json({ message: "Success", post: existingPost });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const deletePostAdmin = async (req, res) => {
  try {
    const { community, id, postId } = req.params;
    const foundCommunity = await post.findOne({ community_name: community });
    const foundID = await admin.findOne({ email: id });
    if (!foundCommunity) {
      return res.status(404).send({ msg: "Community not found" });
    }
    if (!foundID) {
      return res.status(404).send({ msg: "Email not found" });
    }
    // delete comments
    const deleteComments = await commentModle.deleteMany({ post_id: postId });
    // delete post
    const deletedPost = await post.findOneAndDelete({
      _id: postId,
      community_name: community,
    });
    if (!deletedPost) {
      return res.status(404).send({ msg: "Post not found" });
    }
    return res.status(200).send({ msg: "Post deleted successfully" });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).send({ msg: "Internal Server Error" });
  }
};
