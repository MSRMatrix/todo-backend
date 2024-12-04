import express from "express"

const router = express.Router()

router
.route("/").get()

router
.route("/").post()

router
.route("/").delete()

router
.route("/").patch()

export default router;