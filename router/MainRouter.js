import express from "express"
import UserRouter from "./UserRouter.js"
import ListRouter from "./ListRouter.js"
import TaskRouter from "./TaskRouter.js"
import { authorize } from "../controller/UserController.js"

const router = express.Router()

router
.use("/user", UserRouter)

router
.use("/list", ListRouter)

router
.use("/task", TaskRouter)

export default router;

// router
// .use("/list", authorize(["User"]), ListRouter)

// router
// .use("/task", authorize(["User"]), TaskRouter)