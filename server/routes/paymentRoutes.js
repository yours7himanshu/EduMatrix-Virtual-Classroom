const express = require("express");
const { authStudent } = require("../middlewares/auth");
const { payfees, verifyPayment } = require("../controllers/paymentController");

const paymentRouter = express.Router();
paymentRouter.post("/payfees", authStudent, payfees);
paymentRouter.post("/payment/verify", authStudent, verifyPayment);

module.exports = { paymentRouter };