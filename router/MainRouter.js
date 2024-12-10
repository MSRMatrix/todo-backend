import express from "express"
import UserRouter from "./UserRouter"
import ListRouter from "./ListRouter"
import TaskRouter from "./TaskRouter"
import { authorize } from "../controller/UserController"

const router = express.Router()

router
.use("/user", UserRouter)

router
.use("/list", authorize(["User"]), ListRouter)

router
.use("/task", authorize(["User"]), TaskRouter)

export default router;