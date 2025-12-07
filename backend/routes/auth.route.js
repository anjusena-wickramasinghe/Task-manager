import express from "express";
import { signup, signin, userProfile,updateUserProfile } from "../controller/auth.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/sign-up", signup);
router.post("/sign-in", signin);
router.get("/user-profile", verifyToken, userProfile);
router.put("/update-profile",verifyToken,updateUserProfile)


export default router;
