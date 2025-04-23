import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import axios from "axios";
import { toast } from "react-toastify";
const Verify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const paymentId = searchParams.get("paymentId");
  const url = import.meta.env.VITE_BACKEND_URL;

  const verifypayment = async () => {
    try {
      const response = await axios.post(`${url}/api/v10/payment/verify`, {
        success,
        paymentId,
      });

      if (response.data.success) {
        toast.success("Payment verified successfully!");
        navigate("/StudentDashboard/dashboard");
      } else {
        toast.error("Payment verification failed. Please try again.");
        navigate("/StudentDashboard/payfees");
      }
    } catch (error) {
      console.log("Verification error:", error);
      toast.error("An error occurred during payment verification.");
      navigate("/StudentDashboard/payfees");
    }
  };

  useEffect(() => {
    if (success && paymentId) {
      verifypayment();
    }
  }, [success, paymentId]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      <p className="mt-4 text-gray-600">Verifying your payment...</p>
    </div>
  );
};

export default Verify;
