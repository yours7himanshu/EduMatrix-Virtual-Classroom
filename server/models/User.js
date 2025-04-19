const mongoose = require("mongoose");

const user = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
    },

    accountVerified: {
      type: Boolean,
      default: false,
    },

    borrowedBooks: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Borrow",
        },
        returned: {
          type: Boolean,
          default: false,
        },
        bookTitle: String,
        borrowdedDate: Date,
        dueDate: Date,
      },
    ],

    avatar: {
      publicId: String,
      url: String,
    },
    verificationCode: Number,
    verificationCodeExpire: Date,
    resetPasswordToken: Date,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);
user.methods.generateVerificationCode = function () {
  function generateOtp() {
    const firstDigit = Math.floor(Math.random() * 9) + 1;
    const remainingDigits = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(4, 0);
    return parseInt(firstDigit + remainingDigits);
    
  }
  const verificationCode = generateOtp();
  this.verificationCode = verificationCode;
  this.verificationCodeExpire = Date.now() + 15 * 60 * 1000;
};

module.exports = mongoose.model("user", user);
