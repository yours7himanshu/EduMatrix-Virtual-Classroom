import express from "express"

import {  authStudent } from "../middlewares/auth.js"
import { payfees, verifyPayment } from "../controllers/paymentController.js"
export const paymentRouter = express.Router()
paymentRouter.post("/payfees",authStudent,payfees)
paymentRouter.post("/payment/verify",verifyPayment)