import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2, ShieldCheck } from "lucide-react";

const Verify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const paymentId = searchParams.get("paymentId");
  const sessionId = searchParams.get("session_id") || searchParams.get("sessionId");
  const url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!success || !paymentId) return;

    const verifypayment = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${url}/api/v10/payment/verify`,
          {
            success,
            paymentId,
            sessionId,
          },
          {
            headers: token ? { token } : {},
          }
        );

        if (response.data.success) {
          toast.success("Payment verified successfully!");
          navigate("/StudentDashboard/dashboard");
        } else {
          const msg = response.data.message || "Payment verification failed. Please try again.";
          toast.error(msg);
          navigate("/StudentDashboard/payfees");
        }
      } catch (error) {
        console.log("Verification error:", error);
        const errorMsg =
          error.response?.data?.message || "An error occurred during payment verification.";
        toast.error(errorMsg);
        navigate("/StudentDashboard/payfees");
      }
    };

    verifypayment();
  }, [success, paymentId, sessionId, url, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 antialiased">
      <div className="w-full max-w-md rounded-3xl border border-ink-900/[0.08] bg-white px-8 py-10 text-center shadow-[0_2px_8px_rgba(19,19,40,0.05),0_28px_60px_-32px_rgba(19,19,40,0.28)]">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-600">
          <Loader2 size={26} className="animate-spin" />
        </span>

        <h1 className="mt-6 font-display text-[21px] font-extrabold tracking-tight text-ink-900">
          Verifying transaction
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
          Please wait while we confirm your payment with the banking gateway and
          update your student ledger.
        </p>

        <div className="mt-7 flex items-center justify-center gap-2 border-t border-ink-900/[0.06] pt-5 text-[11.5px] font-semibold text-ink-400">
          <ShieldCheck size={14} className="text-emerald-600" />
          Secure encrypted handshake
        </div>
      </div>
    </div>
  );
};

export default Verify;