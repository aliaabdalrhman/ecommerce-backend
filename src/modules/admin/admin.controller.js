import admin from "../../../db/modle/admin.modle.js";
import communities from "../../../db/modle/community.modle.js";
import log from "../../../db/log.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const community = async (req, res) => {
  communities
    .find({}, {})
    .then((communitiesD) => {
      return res.status(200).send(communitiesD);
    })
    .catch(() => {
      return res.status(404).send({ msg: "con not find communities" });
    });
};
//////////////////////////////////////////////////////////////////////////////
export const addAdmin = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    adminAt,
    degree,
    bithday,
    address,
  } = req.body;
  //console.log({ first_name, last_name, email, password, adminAt, degree, bithday, address });
  const findAdmin = await log.findOne({ email: email });
  //console.log(findAdmin);

  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.SALT_ROUND)
  );
  if (findAdmin) {
    return res.status(401).send({ msg: "this admin is already exists" });
  } else {
    const newAdmin = await admin.create({
      email: email,
      first_name: first_name,
      last_name: last_name,
      address: address,
      community_id: adminAt,
      birth_date: bithday,
    });
    newAdmin.save();
    const newAdminLog = await log.create({
      email: email,
      role: degree,
      password: hashedPassword,
    });
    newAdminLog.save();
    return res.status(201).send({ msg: "admin created" });
  }
};
//////////////////////////////////////////////////////////////////////////////
export const deleteAdmin = async (req, res) => {
  const adminEmail = req.params.email;

  if (adminEmail !== undefined) {
    try {
      const adminRecord = await log.findOne({ email: adminEmail });

      if (!adminRecord) {
        return res.status(404).send({ msg: "Admin not found" });
      }

      await admin.deleteOne({ email: adminEmail });
      await log.deleteOne({ email: adminEmail });

      return res.status(200).send({ msg: "Admin deleted successfully" });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).send({ msg: "Internal Server Error" });
    }
  } else {
    return res.status(400).send({ msg: "Invalid admin email" });
  }
};
//////////////////////////////////////////////////////////////////////////////
export const viewCommunityAdmins = async (req, res) => {
  try {
    const userEmail = req.params.email;
    if (!userEmail) {
      return res.status(404).send({ msg: "Invalid email" });
    }
    const community = await admin.findOne({ email: userEmail }, { community_id: 1, _id: 0 });
    if (!community) {
      return res.status(404).send({ msg: "Admin not found or not associated with any community" });
    }
    // Exclude the user's email from the query
    const admins = await admin.find({
      community_id: community.community_id,
      email: { $ne: userEmail } // $ne means not equal to
    });

    // Fetch additional information from the log table for each admin
    const adminsPromiseArray = admins.map(async (admin) => {
      const logInfo = await log.findOne({ email: admin.email });
      return { ...admin.toObject(), ...logInfo?.toObject() }; // Use optional chaining to handle null logInfo
    });

    const adminsWithLogInfo = await Promise.all(adminsPromiseArray);

    return res.status(200).send(adminsWithLogInfo);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ msg: "Internal Server Error" });
  }
};
//////////////////////////////////////////////////////////////////////////////
export const disableAccount = async (req, res) => {
  const adminEmail = req.params.email;
  if (!adminEmail) {
    return res.status(400).send({ msg: "Invalid Account email" });
  }
  try {
    const adminRecord = await log.findOne({ email: adminEmail });
    if (!adminRecord) {
      return res.status(404).send({ msg: "Account not found" });
    }
    await log.findOneAndUpdate({ email: adminEmail }, { state_us: false });
    return res.status(200).send({ msg: "Account is disabled" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ msg: "Cannot disable this account" });
  }
};
//////////////////////////////////////////////////////////////////////////////
export const enableAccount = async (req, res) => {
  const adminEmail = req.params.email;
  if (!adminEmail) {
    return res.status(400).send({ msg: "Invalid Account email" });
  }
  try {
    const adminRecord = await log.findOne({ email: adminEmail });
    if (!adminRecord) {
      return res.status(404).send({ msg: "Account not found" });
    }
    await log.findOneAndUpdate({ email: adminEmail }, { state_us: true });
    return res.status(200).send({ msg: "Account is enabled" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ msg: "Cannot enable this account" });
  }
};
//////////////////////////////////////////////////////////////////////////////
export const recoverPassword = async (req, res) => {
  const email = req.params.email;
  const { password } = req.body;

  if (!email) {
    return res.status(400).send({ msg: "Invalid email" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));

    const userRecord = await log.findOne({ email });

    if (!userRecord) {
      return res.status(404).send({ msg: "User not found" });
    }

    await log.updateOne({ email }, { password: hashedPassword });

    return res.status(200).send({ msg: "Password is updated" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ msg: "Internal Server Error" });
  }
};
//////////////////////////////////////////////////////////////////////////////
export const viewAdmins = async (req, res) => {
  try {
    const userEmail = req.params.email; // Assuming you can get the user's email from the request

    const Admins = await admin.find({ email: { $ne: userEmail } }).lean();
    const Adminslog = await log
      .find({
        role: { $in: ["SubAdmin", "SuperAdmin"] },
        email: { $ne: userEmail }, // Exclude the user's email
      })
      .select("email state_us role")
      .lean();

    // Combine Admins and AdminsLog based on email
    const mergedAdmins = Admins.map(individualAdmin => {
      const logInfo = Adminslog.find(log => log.email === individualAdmin.email) || {};
      return { ...individualAdmin, ...logInfo };
    });

    const response = {
      message: "success",
      Admins: mergedAdmins,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



