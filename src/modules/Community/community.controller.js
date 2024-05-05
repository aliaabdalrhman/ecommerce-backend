import slugify from "slugify";
import cloudinary from "../../services/cloudinary.js";
import community from "../../../db/modle/community.modle.js";
import communityproperties from "../../../db/modle/communityProperties.modle.js";
import postModel from "../../../db/modle/post.modle.js";
import commentModel from "../../../db/modle/comment.modle.js";
import adminModel from "../../../db/modle/admin.modle.js";
import logModel from "../../../db/log.js";
import Community from "../../../db/modle/community.modle.js";
export const viewCommunities = async (req, res) => {
  community
    .find({}, { community_name: 1, description: 1, _id: 0 })
    .then((communityD) => {
      res.send(communityD);
    })
    .catch((err) => {
      res.send("something error");
    });
};
// export const getCommunities = async (req, res) => {
//   try {
//     const communities = await community.find(); //.select('community_name'); اختار ايش اعرض
//     return res.status(200).json({ message: "success", communities });
//   } catch (error) {
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };
export const getCommunities = async (req, res) => {
  try {
    //test role
    const user = req.params.id;
    const find = await logModel.findOne({ email: user });
    if (!find) {
      return res.status(404).json({ msg: "this user doesn't exists " });
    }
    if (find.role === "SubAdmin") {
      console.log(find);
      const community = await adminModel.findOne({ email: find.email }, {}); //.select('community_name'); اختار ايش اعرض
      console.log(community);
      let communities = []
      let communities1 = await Community.findOne({ community_name: community.community_id }, {});
      communities.push(communities1);
      console.log(communities);
      return res.status(200).json({ message: "success", communities });
    }
    const communities = await community.find(); //.select('community_name'); اختار ايش اعرض
    return res.status(200).json({ message: "success", communities });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getSpecificCommunity = async (req, res) => {
  const { id } = req.params;
  const Community = await community.findById(id);
  return res.status(200).json({ message: "success", Community });
};
export const createCommunity = async (req, res) => {
  try {
    // التحقق من وجود ملف في الطلب
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a image" });
    }

    // التحقق من وجود البيانات اللازمة في req.body
    const { community_name, description } = req.body;
    if (!community_name || !description) {
      return res
        .status(400)
        .json({ message: "Please provide community_name and description" });
    }
    const lowerCaseCommunityName = community_name.toLowerCase();
    console.log(lowerCaseCommunityName);
    // التحقق من عدم وجود اسم المجتمع في قاعدة البيانات
    const existingCommunity = await community.findOne({
      community_name: { $regex: new RegExp(`^${community_name}$`, 'i') }
    });

    if (existingCommunity) {
      return res.status(409).json({ message: "Community name already exists" });
    }

    // رفع الصورة إلى Cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.APP_NAME}/communities`,
      }
    );

    // إنشاء Slug
    const slugname = slugify(lowerCaseCommunityName);

    // إنشاء مجتمع جديد
    const newCommunity = await community.create({
      community_name,
      slug: slugname,
      image: { secure_url, public_id },
      description,
    });

    return res
      .status(201)
      .json({ message: "Community created successfully", newCommunity });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const updateCommunity = async (req, res) => {
  const Community = await community.findById(req.params.id);

  // return res .json(Community);
  try {
    if (!Community) {
      return res
        .status(404)
        .json({ message: `Community not found with id: ${req.params.id}` });
    }
    if (req.body.community_name) {
      if (
        await community
          .findOne({ community_name: req.body.community_name })
          .select("community_name")
      ) {
        return res.status(409).json({
          message: `Community ${req.body.community_name} name already exists`,
        });
      }
      Community.community_name = req.body.community_name;
      Community.slug = slugify(req.body.community_name);
    }
    if (req.body.status) {
      Community.status = req.body.status;
    }
    if (req.body.description) {
      Community.description = req.body.description;
    }
    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        { folder: `${process.env.APP_NAME}/Communities` }
      );
      await cloudinary.uploader.destroy(Community.image.public_id);
      Community.image = { secure_url, public_id };
    }
    await Community.save();

    return res
      .status(200)
      .json({ message: "Community updated successfully", Community });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getActiveCommunities = async (req, res) => {
  try {
    const communities = await community.find({ status: "Active" }).select(
      "community_name image description"
    );
    return res.status(200).json({ message: "success", communities });
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const addPropertys = async (req, res) => {
  const { propertyD, ownerFillD, customerFillD, valueD } = req.body;
  const latestCommunity = await community
    .findOne({}, { community_name: 1, created_date: 1, _id: 0 })
    .sort({ createdAt: -1 })
    .exec();
  console.log(latestCommunity);
  console.log(latestCommunity.community_name);
  const propertyDB = await communityproperties.findOne({
    $and: [{ property: propertyD }, { community_Name: latestCommunity.community_name }],
  });
  console.log(propertyDB);
  if (propertyDB) {
    res.status(401).send({ msg: "This this property already exists" });
  } else {
    const newProperty = await communityproperties.create({
      community_Name: latestCommunity.community_name,
      property: propertyD,
      value: valueD,
      owner_fill: ownerFillD,
      customer_fill: customerFillD,
    });
    newProperty.save();
    console.log({ propertyD, valueD, ownerFillD, customerFillD });
    res.send("added successfuly");
  }
};
export const updateProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const updatedFields = req.body;
    // التحقق من وجود الخاصية
    const propertyInstance = await communityproperties.findById(propertyId);
    if (!propertyInstance) {
      return res
        .status(404)
        .json({ message: `Property not found with id: ${propertyId}` });
    }
    // التحقق من وجود اسم الخاصية المحدثة
    if (updatedFields.propertyD) {
      const existingProperty = await communityproperties.findOne({
        propertyD: updatedFields.propertyD,
      });
      if (existingProperty && existingProperty._id.toString() !== propertyId) {
        return res.status(409).json({
          message: `Property ${updatedFields.propertyD} name already exists`,
        });
      }
      propertyInstance.propertyD = updatedFields.propertyD;
    }

    // التحقق من وجود القيمة المحدثة
    if (updatedFields.valueD) {
      propertyInstance.valueD = updatedFields.valueD;
    }

    // التحقق من وجود العميل المحدث
    if (updatedFields.customerFillD) {
      propertyInstance.customerFillD = updatedFields.customerFillD;
    }

    // التحقق من وجود المالك المحدث
    if (updatedFields.ownerFillD) {
      propertyInstance.ownerFillD = updatedFields.ownerFillD;
    }

    // حفظ التغييرات
    await propertyInstance.save();

    return res
      .status(200)
      .json({
        message: "Property updated successfully",
        property: propertyInstance,
      });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const removeProperty = async (req, res) => {
  const { communityName, propertyD } = req.body;
  communityproperties
    .deleteOne({ community_Name: communityName, property: propertyD })
    .then((result) => {
      return res.json(result);
    })
    .catch((err) => {
      console.error(err);
      return res.json("something error here!");
    });
};
export const cancleCreation = async (req, res) => {
  const { communityName } = req.body;
  communityproperties
    .deleteMany({ community_Name: communityName })
    .then((result) => { })
    .catch((err) => {
      console.error(err);
      return res.json("something error here!");
    });
  community
    .deleteOne({ community_name: communityName })
    .then((result) => {
      return res.json({ msg: "deleting done" });
    })
    .catch((err) => {
      console.error(err);
      return res.json("something error here!");
    });
}
export const viewProperty = async (req, res) => {
  const { community_name } = req.params;
  communityproperties
    .find({ community_Name: community_name }, { __v: 0 })
    .then((propertiesD) => {
      res.send(propertiesD);
    })
    .catch((err) => {
      res.send("something error");
    });
};
///Done
export const deleteProperty = async (req, res) => {
  const { community, id } = req.params;

  if (!community || !id) {
    return res.status(400).json({ msg: "Invalid community or property ID" });
  }

  try {
    const result = await communityproperties.deleteOne({
      community_Name: community,
      _id: id, // Use _id for MongoDB ObjectId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ msg: "Property not found" });
    }

    return res.status(200).json({ msg: "Property deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};
export const deleteCommunity = async (req, res) => {
  try {
    const community_name = req.params.community_name;

    console.log("Deleting community:", community_name);

    // Find the community by name
    const foundCommunity = await community.findOne({ community_name });

    console.log("Found community:", foundCommunity);

    if (!foundCommunity) {
      console.log("Community not found");
      return res.status(404).json({ message: "Community not found" });
    }

    // Delete the community image from Cloudinary
    await cloudinary.uploader.destroy(foundCommunity.image.public_id);

    console.log("Community image deleted from Cloudinary");
    const posts = await postModel.find({ community_name: community_name });
    for (let i of posts) {
      //delete comments
      const deleteComments = await commentModel.deleteMany({ post_id: i._id });
    }
    // delete posts
    const deletePosts = await postModel.deleteMany({ community_name });
    // delete propreties
    const deletePropreties = await communityproperties.deleteMany({
      community_Name: community_name,
    });
    const admins = await adminModel.find({ community_id: community_name });
    for (let i of admins) {
      const updateStatUs = await logModel.findOneAndUpdate(
        { email: i.email, role: "SubAdmin" },
        { state_us: false }
      );
    }
    // Delete the community from the database
    const deletionResult = await community.deleteOne({ community_name });
    console.log("Deletion result:", deletionResult);

    if (deletionResult.deletedCount === 0) {
      console.log("Community not deleted from the database");
      return res
        .status(404)
        .json({ message: "Community not deleted from the database" });
    }

    console.log("Community deleted successfully");

    return res.status(200).json({ message: "Community deleted successfully" });
  } catch (error) {
    console.error("Error:", error);

    // Add a return statement here with an error response
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const addProperty = async (req, res) => {
  const { propertyD, ownerFillD, customerFillD, valueD } = req.body;
  const { community_name } = req.params;  // تحديث اسم المتغير

  const foundCommunity = await community.findOne({ community_name: community_name });

  if (!foundCommunity) {
    res.status(404).send({ msg: "Community not found." });
    return;
  }

  const propertyDB = await communityproperties.findOne({
    $and: [{ property: propertyD }, { community_Name: foundCommunity.community_name }],
  });

  if (propertyDB) {
    res.status(401).send({ msg: "This property already exists." });
  } else {
    const newProperty = await communityproperties.create({
      community_Name: foundCommunity.community_name,
      property: propertyD,
      value: valueD,
      owner_fill: ownerFillD,
      customer_fill: customerFillD,
    });

    newProperty.save();
    console.log({ propertyD, valueD, ownerFillD, customerFillD });
    res.send("Added successfully.");
  }
};


