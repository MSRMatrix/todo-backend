import express from "express"

import { createUser, getAllUser } from "../controller/UserController";

const router = express.Router()

router
.route("/").get(getAllUser)


router
.route("/").post(createUser)

export default router;