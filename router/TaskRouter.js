import express from "express"
import { checkTask, createTask, deleteTask, toggleAllTasks, updateTask } from "../controller/taskController.js"
import { taskUpdateValidator, taskValidator, validateRequest } from "../middlewares/validator/validatorFunctions.js"

const router = express.Router()

router
.route("/").post(taskValidator, validateRequest ,createTask)

router
.route("/").delete(deleteTask)

router
.route("/check").patch(checkTask)

router
.route("/check-all").patch(toggleAllTasks)

router.route("/update").patch(taskUpdateValidator(["task"]), validateRequest ,updateTask)

export default router;