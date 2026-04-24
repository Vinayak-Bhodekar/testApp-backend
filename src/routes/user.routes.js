import { Router } from "express";
import { registerUser,
  changeUserPassword,
  getCurrentUser,
  getUserChannelProfile,
  updateAccountDetail,
   updateUserAvatar,
    updateUserCover,
    logoutUser,loginUser,
     refreshAccessToken,
     getWatchHistory
     } from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//unsecured routes

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)

//secured routes

router.route("/logout").post(verifyJWT,logoutUser)
router.route("/change-password").post(verifyJWT,changeUserPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/c/:userName").get(verifyJWT,getUserChannelProfile)
router.route("/update-account").post(verifyJWT,updateAccountDetail)
router.route("/history").get(verifyJWT,getWatchHistory)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)


router.route("/cover-Image").patch(verifyJWT,upload.single("coverImage"),updateUserCover)


export default router