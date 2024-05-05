import { Router } from "express";
import * as postcontroller from "./comment.control.js";
const router = Router();

router.post(
  "/:community/:post/:id/createComment",
  postcontroller.createComment
);
router.delete(
  "/:community/:post/:id/deleteCommentAdmin/:commentId",
  postcontroller.deleteCommentAdmin
);
router.get("/:community/:post/viewComment", postcontroller.viewComment);
// router.delete(
//   "/:community/:post/:id/deleteComment/:commentId",
//   postcontroller.deleteComment
// );

router.delete(
  "/:community/:post/:id/deleteComment/:commentId",
  postcontroller.deleteComment
);
//router.get("/:community/:post/commentNumbers", postcontroller.commentNumbers);
//delete
export default router;
