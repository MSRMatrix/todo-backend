import express from "express"
import UserRouter from "./UserRouter"
import ListRouter from "./ListRouter"
import TaskRouter from "./TaskRouter"

const router = express.Router()

router
.use("/user", UserRouter)

router
.use("/list", ListRouter)

router
.use("/task", TaskRouter)

export default router;