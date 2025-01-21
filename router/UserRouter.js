import express from "express"

import { authorize, createUser, deleteUser, getData, getUserData, login, logout, testTwoFactorAuthentication, toggleTwoFactorAuthentication, updateUser, verifyEmail } from "../controller/userController.js";
import { userUpdateValidator, userValidator, validateRequest } from "../middlewares/validator/validatorFunctions.js";

const router = express.Router()

router
.route("/", authorize(["User"])).get(getUserData)

router
.route("/").post(userValidator, validateRequest , createUser)

router
.route("/login").post(login);

router
.route("/logout").post(logout);

router
.route("/verify").post(verifyEmail);

router
.route("/test-two-factor-authentication").post(testTwoFactorAuthentication)

router
.route("/toggle-two-factor-authentication", authorize(["User"])).post(toggleTwoFactorAuthentication)

router
.route("/", authorize(["User"])).delete(deleteUser)

router
.route("/", authorize(["User"])).patch(userUpdateValidator([
    "username",
    "email",
    "password",
  ]), validateRequest ,updateUser)

router
.route("/get-data").get(getData)



export default router;