// import slugify from "slugify";
// import cloudinary from "../../services/cloudinary.js";
// import Community from "../../../db/modle/communitys.modle.js";
// export const createCommunitys = async (req, res) => {
//   const { community_name, description } = req.body;
//   const communitys = await Community.findOne({ community_name });
//   if (communitys) {
//     return res.status(409).json({ message: "category name already exists" });
//   }
//   const slugname = slugify(community_name);
//   const { secure_url, public_id } = await cloudinary.uploader.upload(
//     req.files.image[0].path,
//     {
//       folder: `${process.env.APP_NAME}/post`,
//     }
//   );

//   const iphone = await Community.create({
//     community_name,
//     slug: slugname,
//     image: { secure_url, public_id },
//     description,
//   });
//   return res.status(201).json(req.files);
// };
// export const createCommunity = async (req, res) => {
//   const { community_name, description } = req.body;
//   const lowerCaseCommunityName = community_name.toLowerCase();
//   const communitys = await community.findOne({ community_name });
//   if (communitys) {
//     return res.status(409).json({ message: "category name already exists" });
//   }
//   const slugname = slugify(lowerCaseCommunityName);
//   const { secure_url, public_id } = await cloudinary.uploader.upload(
//     req.file.path,
//     {
//       folder: `${process.env.APP_NAME}/comynites`,
//     }
//   );

//   const NewCommunity = await community.create({
//     community_name,
//     slug: slugname,
//     image: { secure_url, public_id },
//     description,
//   });
//   return res.status(201).json({ message: "success", NewCommunity });
// };
