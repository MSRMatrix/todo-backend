import express from "express"
import { createList, deleteList, emptyList, resetData, updateList } from "../controller/listController.js"
import { listUpdateValidator, listValidator, validateRequest } from "../middlewares/validator/validatorFunctions.js"

const router = express.Router()

router
.route("/").post(listValidator, validateRequest ,createList)

router
.route("/").delete(deleteList)

router
.route("/").patch(listUpdateValidator(["name", "description"]), validateRequest ,updateList)

router
.route("/reset-data").delete(resetData)

router
.route("/empty-list").delete(emptyList)

export default router;