import express from "express"
import { allLists, createList, deleteList, updateList } from "../controller/listController"

const router = express.Router()

router
.route("/").get(allLists)

router
.route("/").post(createList)

router
.route("/").delete(deleteList)

router
.route("/").patch(updateList)

export default router;