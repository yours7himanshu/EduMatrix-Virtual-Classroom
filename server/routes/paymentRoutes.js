import express from "express"

import {  authStudent } from "../middlewares/auth.js"
import { payfees } from "../controllers/paymentController.js"
export const paymentRouter = express.Router()
paymentRouter.post("/payfees",authStudent,payfees)