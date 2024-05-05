import { Router } from "express";
import CommunityRouter from "./Community/Community.router.js";
import PostRouter from "./Post/post.router.js";
import AuthRouter from "./Auth/atuh.router.js";
import connectdb from "../../db/connection.js";
import AdminRouter from "./admin/admin.router.js";
import UserRouter from "./user/user.router.js";
import CommentRouter from "./comment/comment.router.js";
import User from "./user.do/user.router.js";
const initapp = async (app, express) => {
  const router = Router();
  //jokq fxzt cvma sleg, email:r.r.suwan2001@gmail.com
  app.use(express.json());

  // Connect to the database
  try {
    await connectdb();
    console.log("Database connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
  // Set up the routes
  app.get("/", (req, res) => {
    return res.status(200).json({ message: "Welcome" });
  });

  app.use("/auth", AuthRouter);
  app.use("/community", CommunityRouter);
  app.use("/admins", AdminRouter);
  app.use("/user", UserRouter);
  app.use("/communities", PostRouter);
  app.use("/comments", CommentRouter);
  app.use("/userDo", User);
  app.get("*", (req, res) => {
    return res.status(404).json({ message: "Page not found" });
  });
};

export default initapp;