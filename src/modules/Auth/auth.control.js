import userModel from "../../../db/modle/User.modle.js";
import logModel from "../../../db/log.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendemail } from "../../services/email.js";
//import { nanoid } from "nanoid";
import { customAlphabet } from "nanoid";
export const SignUp = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (user) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUND)
    );
    const newUser = await userModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      // confirmEmail: false,
    });

    const token = jwt.sign({ email }, process.env.CONFIRMEMAILSECRET);

    const userLog = await logModel.create({
      email,
      password: hashedPassword,
      // role: "User",
    });
    await sendemail(
      email,
      "Confirm Email",
      `<a href='${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}'>Verify</a>`
    );

    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error in signUp:", error); // سجّل الخطأ هنا
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
export const confirmEmail = async (req, res) => {
  const token = req.params.token;

  try {
    // فحص صحة الرمز باستخدام المفتاح السري
    const decodedToken = jwt.verify(token, process.env.CONFIRMEMAILSECRET);

    // التحقق من نجاح عملية الفحص
    if (!decodedToken) {
      return res.status(404).json({ message: "Invalid Authorization Token" });
    }

    // تحديث حالة التأكيد في قاعدة البيانات
    const updatedUser = await userModel.findOneAndUpdate(
      { email: decodedToken.email, confirmEmail: false },
      { confirmEmail: true },
      { new: true }
    );

    // التحقق من نجاح عملية التحديث
    if (!updatedUser || !updatedUser.confirmEmail) {
      return res.status(400).json({
        message: "Invalid: Email is already verified or does not exist",
      });
    }

    // رسالة نجاح التحقق
    return res.status(200).json({ message: "Your email is verified" });
  } catch (error) {
    // التعامل مع الأخطاء
    console.error("Error in confirmEmail:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const sendCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await logModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const code = customAlphabet("1234567890", 4)();

    const updatedUser = await userModel.findOneAndUpdate(
      { email },
      { sendCode: code },
      { new: true }
    );

    const html = `<h2>The code is: ${code}</h2>`;
    await sendemail(email, `Reset Password`, html);

    return res.status(200).json({ message: "Success", user: updatedUser });
  } catch (error) {
    console.error("Error in sendCode:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const forgotPassword = async (req, res) => {
  const { email, password, code } = req.body;
  const usercode = await userModel.findOne({ email });
  const user = await logModel.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "not register account" });
  }
  if (usercode.sendCode !== code) {
    return res.status(400).json({ message: "invalid code" });
  }
  let match = await bcrypt.compare(password, user.password);
  if (match) {
    return res.status(405).json({ message: "same password" });
  }
  user.password = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));
  usercode.sendCode = null;
  await user.save();
  return res.status(200).json({ message: "success" });
};
export const SignIn = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await logModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: `Invalid password for user ${email}` });
    }
    if (!user.state_us) {
      return res.status(401).json({ message: "Account is disabled" });
    }
    if (user.role == "User") {
      const userconfirm = await userModel.findOne({ email });
      if (!userconfirm.confirmEmail) {
        return res.status(401).json({ message: "Email not confirmed" });
      }
    }
    const token = jwt.sign(
      { id: user._id, role: user.role, state_us: user.state_us },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );
    const refreshtoken = jwt.sign(
      { id: user._id, role: user.role, state_us: user.state_us },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 60 * 24 * 30 }
    );

    return res.status(200).json({
      message: "User signed in successfully",
      email: email,
      role: user.role,
      token: token,
      refreshtoken,
    });
  } catch (error) {
    console.error(`Error in SignIn for user ${email}:`, error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const sendCode2 = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await logModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const code = customAlphabet("1234567890", 4)();

    const updatedUser = await logModel.findOneAndUpdate(
      { email },
      { sendCode: code },
      { new: true }
    );

    const html = `<h2>The code is: ${code}</h2>`;
    await sendemail(email, `Reset Password`, html);

    return res.status(200).json({ message: "Success", user: updatedUser });
  } catch (error) {
    console.error("Error in sendCode:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const forgotPassword2 = async (req, res) => {
  const { email, password, code } = req.body;
  const user = await logModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "not register account" });
  }
  if (user.sendCode !== code) {
    return res.status(400).json({ message: "invalid code" });
  }
  let match = await bcrypt.compare(password, user.password);
  if (match) {
    return res.status(405).json({ message: "same password" });
  }
  user.password = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));
  user.sendCode = null;
  await user.save();
  return res.status(200).json({ message: "success" });
};