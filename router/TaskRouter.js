import express from "express"
import { checkTask, createTask, deleteTask, updateTask } from "../controller/taskController"

const router = express.Router()

router
.route("/").get()

router
.route("/").post(createTask)

router
.route("/").delete(deleteTask)

router
.route("/check").patch(checkTask)

router.route("/update").patch(updateTask)

export default router;