import express from "express"

import { createUser, deleteUser, getUser, updateUser } from "../controller/UserController";

const router = express.Router()

router
.route("/").get(getUser)

router
.route("/").post(createUser)

router
.route("/").delete(deleteUser)

router
.route("/").patch(updateUser)

export default router;