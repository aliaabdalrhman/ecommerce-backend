import { Router } from "express";
import * as postcontroller from "./post.controller.js";
import fileUpload, { fileValidation } from "../../services/multer.js";
const router = Router();

router.get("/:community/postView", postcontroller.postView);
// router.post("/:community/:id/createPost", postcontroller.createPost);
// router.post(
//     "/:community/:id/createPost",
//     fileUpload(fileValidation.image).fields([
//       {name:'Images',maxCount:10},
//       ]),
//     postcontroller.createPost
//   );
router.post(
    "/:id",
    fileUpload(fileValidation.image).fields([
        { name: 'Images', maxCount: 10 },
    ]),
    postcontroller.addPostImage
);
router.delete("/:community/:id/deletePostAdmin/:postId", postcontroller.deletePostAdmin);

router.post("/:community/:id/createPost", postcontroller.createPosts);
router.get("/:community/viewPosts", postcontroller.viewPost);
router.delete("/:community/:id/deletePost/:postId", postcontroller.deletePost);
// router.put('/editPost',postcontroller.updatePost);
// router.post("/:community/:id/addImages", fileUpload(fileValidation.image).fields([

//     {name:'Images',maxCount:30},
//       ]),postcontroller.addImages);

// router.post(
//     "/:id",
//     fileUpload(fileValidation.image).single("image"),
//     postcontroller.addImages
// );
// router.post("/:community/likePost", postcontroller.likePost);
//router.delete("/:community/:email/deletePost/:postId", postcontroller.deletePost);

export default router;