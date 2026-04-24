import express from "express";
import { publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideos

 } from "../controllers/video.controller.js";
import { videoUpload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { get } from "mongoose";

const router = express.Router();

// Use this route in Postman to test video upload
router.route("/videoUpload").post(
    verifyJWT,
    videoUpload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbNail", maxCount: 1 },
      ]),
    publishAVideo
);

router.route("/getVideoById/:videoId").get(verifyJWT,getVideoById);
router.route("/updateVideo/:videoId").patch(verifyJWT,videoUpload.single("thumbNail"),updateVideo)
router.route("/deleteVideo/:videoId").delete(verifyJWT,deleteVideo)
router.route("/isToggled/:videoId").patch(verifyJWT,togglePublishStatus)
router.route("/getAllVideos").get(verifyJWT,getAllVideos)
export default router;
