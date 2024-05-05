import { Router } from "express";
import * as communitycontroller from "./community.controller.js";
import fileUpload, { fileValidation } from "../../services/multer.js";
const router = Router();

router.post(
  "/createCommunity",
  fileUpload(fileValidation.image).single("image"),
  communitycontroller.createCommunity
);

router.get("/:id/getCommunities", communitycontroller.getCommunities);
// router.get("/getCommunities", communitycontroller.getCommunities);
router.get("/getactiveCommunities", communitycontroller.getActiveCommunities);
router.get("/:id", communitycontroller.getSpecificCommunity);
router.post("/:community_name/addProperty", communitycontroller.addProperty);
router.get("/:community_name/viewProperty", communitycontroller.viewProperty);
router.delete(
  "/:community_name/deleteCommunity",
  communitycontroller.deleteCommunity
);
router.post("/cancleCreation", communitycontroller.cancleCreation);
router.delete(
  "/:community/deleteProperty/:id",
  communitycontroller.deleteProperty
);
router.put(
  "/:id",
  fileUpload(fileValidation.image).single("image"),
  communitycontroller.updateCommunity
);
router.put("/prparty/:id", communitycontroller.updateProperty); //مش شغال منيح
export default router;
