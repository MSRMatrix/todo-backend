import express from "express"

import { authorize, createUser, deleteUser, getUserData, updateUser } from "../controller/UserController";
import { userUpdateValidator, userValidator, validateRequest } from "../middlewares/validator/validatorFunctions";

const router = express.Router()

router
.route("/", authorize(["User"])).get(getUserData)

router
.route("/").post(userValidator, validateRequest ,createUser)

router
.route("/", authorize(["User"])).delete(deleteUser)

router
.route("/", authorize(["User"])).patch(userUpdateValidator([
    "username",
    "email",
    "password",
  ]), validateRequest ,updateUser)

export default router;