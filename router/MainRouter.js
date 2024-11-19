import express from "express"
import UserRouter from "./UserRouter"

const router = express.Router()

router
.use("/user", UserRouter)

export default router;