const express = require("express");
const { authStudent } = require("../middlewares/auth");
const { payfees, verifyPayment } = require("../controllers/paymentController");
const { getStudentFeeLedger } = require("../controllers/feeLedgerController");

const paymentRouter = express.Router();
paymentRouter.get("/fees/ledger", authStudent, getStudentFeeLedger);
paymentRouter.get("/fees/summary", authStudent, getStudentFeeLedger);
paymentRouter.post("/payfees", authStudent, payfees);
paymentRouter.post("/payment/verify", authStudent, verifyPayment);

module.exports = { paymentRouter };