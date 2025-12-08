import express from "express"
import {adminOnly, verifyToken} from "../utils/verifyUser.js"
import { getUsers } from "../controller/user.controller.js"

const router = express.Router()

//user mangement route
router.get("/get-users", verifyToken, adminOnly, getUsers)

export default router

