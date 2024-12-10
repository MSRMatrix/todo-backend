import express from "express"
import { createList, deleteList, updateList } from "../controller/listController"
import { listValidator, validateRequest } from "../middlewares/validator/validatorFunctions"

const router = express.Router()

router
.route("/").post(listValidator, validateRequest ,createList)

router
.route("/").delete(deleteList)

router
.route("/").patch(listValidator, validateRequest ,updateList)

export default router;