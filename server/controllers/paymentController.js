const FeesModel = require("../models/feesModel");
const Stripe = require("stripe");

let stripeInstance = null;
const getStripe = () => {
  if (!stripeInstance && process.env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
};

// Helper to inject mock Stripe instance in tests
const setStripeInstance = (instance) => {
  stripeInstance = instance;
};

const payfees = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not configured. Please set STRIPE_SECRET_KEY in server/.env",
      });
    }

    const { amount, rollno, email, year } = req.body;
    const studentId = req.studentId || req.body.studentId;

    if (!studentId || !amount || !rollno || !email || !year) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment fields: studentId, amount, rollno, email, year",
      });
    }

    const feesObject = new FeesModel({
      studentId,
      amount,
      rollno,
      email,
      year,
      status: "unpaid",
    });
    await feesObject.save();

    const line_items = [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: "Tuition fees",
            description: `Fees Payment - Year ${year}`,
          },
          unit_amount: Math.round(Number(amount) * 100),
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: "Additional fees",
            description: "Additional administrative & lab fees",
          },
          unit_amount: 2000 * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      client_reference_id: feesObject._id.toString(),
      customer_email: email,
      metadata: {
        feeId: feesObject._id.toString(),
        studentId: studentId.toString(),
        rollno: String(rollno),
        year: String(year),
      },
      success_url: `${frontend_url}/verify?success=true&paymentId=${feesObject._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend_url}/verify?success=false&paymentId=${feesObject._id}&session_id={CHECKOUT_SESSION_ID}`,
    });

    feesObject.stripeSessionId = session.id;
    await feesObject.save();

    return res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      paymentId: feesObject._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { paymentId, success, sessionId } = req.body;
    const authenticatedStudentId = req.studentId || req.body.studentId;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "paymentId is required",
      });
    }

    if (!String(paymentId).match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid paymentId format",
      });
    }

    const fee = await FeesModel.findById(paymentId);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    // Verify fee record ownership
    if (
      authenticatedStudentId &&
      fee.studentId &&
      fee.studentId.toString() !== authenticatedStudentId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Fee record does not belong to the authenticated student",
      });
    }

    // Handle cancellation
    if (success === "false" || success === false) {
      if (fee.status !== "paid") {
        await FeesModel.findByIdAndDelete(paymentId);
      }
      return res.status(200).json({
        success: false,
        message: "Payment was cancelled",
      });
    }

    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({
        success: false,
        message: "sessionId is required to verify payment",
      });
    }

    // Idempotency: already marked paid
    if (fee.status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        fee,
      });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not configured. Please set STRIPE_SECRET_KEY in server/.env",
      });
    }

    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeError) {
      return res.status(400).json({
        success: false,
        message: "Invalid or nonexistent Stripe session",
      });
    }

    // Check payment status from Stripe
    if (session.payment_status !== "paid") {
      return res.status(402).json({
        success: false,
        message: "Payment has not been completed",
      });
    }

    // Verify session matches the specific fee record
    const matchesClientRef =
      session.client_reference_id &&
      session.client_reference_id === paymentId.toString();
    const matchesMetadataFee =
      session.metadata && session.metadata.feeId === paymentId.toString();
    const matchesRecordedSession =
      fee.stripeSessionId && fee.stripeSessionId === sessionId;

    if (!matchesClientRef && !matchesMetadataFee && !matchesRecordedSession) {
      return res.status(400).json({
        success: false,
        message: "Stripe session does not match this fee record",
      });
    }

    // Verify session belongs to the authenticated student
    if (
      authenticatedStudentId &&
      session.metadata &&
      session.metadata.studentId &&
      session.metadata.studentId !== authenticatedStudentId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Stripe session does not belong to the authenticated student",
      });
    }

    // Update status to "paid" and persist session ID
    fee.status = "paid";
    fee.stripeSessionId = sessionId;
    await fee.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      fee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { payfees, verifyPayment, getStripe, setStripeInstance };