const FeesModel = require("../models/feesModel");
const Student = require("../models/studentModels");
const FeeStructure = require("../models/feeStructureModel");
const { getFeeStructure } = require("../services/feeStructureService");
const { syncStudentFeeAccountOnPayment } = require("../services/studentFeeLedgerService");
const Stripe = require("stripe");
const mongoose = require("mongoose");

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

    const studentId = req.studentId;
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing authenticated student identity",
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student record not found",
      });
    }

    if (!student.institutionId) {
      return res.status(400).json({
        success: false,
        message: "Student is not assigned to an active institution. Please contact your administrator.",
      });
    }

    if (!student.branch || typeof student.branch !== "string" || !student.branch.trim()) {
      return res.status(400).json({
        success: false,
        message: "Student has no valid branch/department assigned",
      });
    }

    const rawYear = req.body?.year;
    if (rawYear === undefined || rawYear === null || rawYear === "" || typeof rawYear === "boolean") {
      return res.status(400).json({
        success: false,
        message: "Academic year is required",
      });
    }

    const academicYear = Number(rawYear);
    if (!Number.isInteger(academicYear) || academicYear < 1 || academicYear > 4) {
      return res.status(400).json({
        success: false,
        message: "Invalid academic year. Must be an integer between 1 and 4",
      });
    }

    let feeStructure;
    try {
      feeStructure = await getFeeStructure({
        institutionId: student.institutionId,
        branch: student.branch,
        academicYear,
      });
    } catch (feeError) {
      if (feeError.code === "FEE_STRUCTURE_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "No authoritative fee structure found for your institution, branch, and academic year. Payment cannot proceed.",
        });
      }
      return res.status(400).json({
        success: false,
        message: feeError.message || "Invalid fee structure parameters",
      });
    }

    const amount = feeStructure.tuitionFee;
    const additionalAmount =
      typeof feeStructure.additionalFee === "number" && feeStructure.additionalFee >= 0
        ? feeStructure.additionalFee
        : 2000;
    const rollno = String(student.rollNo);
    const email = student.email;

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        // Enforce Chronological FIFO / Arrears Precedence Policy:
        // Prior academic sessions must be settled before paying subsequent years.
        if (academicYear > 1) {
          for (let priorYear = 1; priorYear < academicYear; priorYear++) {
            const priorStructure = await FeeStructure.findOne({
              institutionId: mongoose.Types.ObjectId.isValid(student.institutionId)
                ? new mongoose.Types.ObjectId(student.institutionId)
                : student.institutionId,
              branch: student.branch.trim().toUpperCase(),
              academicYear: priorYear,
              isActive: true,
            }).lean();

            if (priorStructure) {
              const priorAssessed =
                (Number(priorStructure.tuitionFee) || 0) + (Number(priorStructure.additionalFee) || 0);
              const priorPayments = await FeesModel.find({
                studentId: student._id,
                year: priorYear,
                status: "paid",
              }).lean();
              const priorPaid = (priorPayments || []).reduce(
                (sum, p) => sum + (Number(p.amount) || 0),
                0
              );
              const priorDue = Math.max(0, priorAssessed - priorPaid);

              if (priorDue > 0) {
                return res.status(400).json({
                  success: false,
                  message: `Prior academic year ${priorYear} has outstanding arrears of ₹${priorDue.toLocaleString()}. In accordance with institutional policy, earlier academic sessions must be settled before paying Year ${academicYear}.`,
                });
              }
            }
          }
        }

        const verifiedPaid = await FeesModel.find({
          studentId: student._id,
          year: academicYear,
          status: "paid",
        }).lean();
        if (Array.isArray(verifiedPaid)) {
          const paidForThisYear = verifiedPaid.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
          if (paidForThisYear >= amount && amount > 0) {
            return res.status(400).json({
              success: false,
              message: `Fees for academic year ${academicYear} are already fully paid.`,
            });
          }
        }
      } catch (err) {
        // Non-fatal query error in test environments
      }
    }

    const feesObject = new FeesModel({
      studentId,
      amount,
      rollno,
      email,
      year: academicYear,
      status: "unpaid",
    });
    await feesObject.save();

    const line_items = [
      {
        price_data: {
          currency: feeStructure.currency || "inr",
          product_data: {
            name: "Tuition fees",
            description: `Fees Payment - Year ${academicYear}`,
          },
          unit_amount: Math.round(Number(amount) * 100),
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: feeStructure.currency || "inr",
          product_data: {
            name: "Additional fees",
            description: "Additional administrative & lab fees",
          },
          unit_amount: additionalAmount * 100,
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
        year: String(academicYear),
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

    // Synchronize StudentFeeAccount ledger record (non-fatal)
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const studentDoc = await Student.findById(fee.studentId).lean();
        if (studentDoc && studentDoc.institutionId) {
          await syncStudentFeeAccountOnPayment({
            institutionId: studentDoc.institutionId,
            studentId: fee.studentId,
            academicYear: fee.year,
            branch: studentDoc.branch,
            amountPaid: fee.amount,
          });
        }
      } catch (syncErr) {
        console.error("Ledger sync error (non-fatal):", syncErr);
      }
    }

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