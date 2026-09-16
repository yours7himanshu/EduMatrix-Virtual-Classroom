import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";
import { CheckCircle2, Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import {
  Badge,
  Card,
  FieldLabel,
  PageHeader,
  selectClass,
} from "../Shared/ui";

const FEES = { cse: 150000, ece: 140000, me: 130000, ce: 120000, it: 125000 };

const Payfees = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handlePay = async () => {
    if (!year || !student) return alert("Please select an academic year.");
    try {
      setLoading(true);
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/v10/payfees`;
      const response = await axios.post(
        url,
        {
          studentId: student._id,
          amount: FEES[student.branch.toLowerCase()] || 150000,
          rollno: student.rollNo,
          email: student.email,
          year,
        },
        { headers: { token: localStorage.getItem("token") } }
      );
      if (response.data.success) {
        window.location.replace(response.data.url);
      }
    } catch (error) {
      console.log("Payment error:", error);
      alert("Payment initiation failed.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudent = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/v5/student-byid`,
        {},
        { headers: { token: localStorage.getItem("token") } }
      );
      if (response.data.studentdetails) {
        setStudent(response.data.studentdetails);
      }
    } catch (error) {
      console.log("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [backendUrl]);

  const branchKey = student?.branch?.toLowerCase() || "cse";
  const calculatedFee = FEES[branchKey] || 150000;

  const details = student
    ? [
        { label: "Student name", value: student.name },
        { label: "Roll number", value: student.rollNo },
        { label: "Department", value: student.branch?.toUpperCase() },
        { label: "Registered email", value: student.email },
      ]
    : [];

return (
    <div className="space-y-6">
      <PageHeader
        chip="FINANCE" chipLabel="Secure fee gateway"
        title="Tuition & fee payment"
        description="Settle semester tuition securely online, with instant receipt generation and automatic ledger updates."
        actions={
          <Badge tone="success" icon={ShieldCheck}>
            256-bit encrypted gateway
          </Badge>
        }
      />

      <Card className="overflow-hidden">
        {student ? (
          <div className="grid lg:grid-cols-[1.35fr_1fr]">
            <div className="space-y-6 p-5 sm:p-6">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-400">
                  Billing profile
                </p>
                <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {details.map((item) => (
                    <div key={item.label}>
                      <dt className="text-[11.5px] font-semibold text-ink-400">
                        {item.label}
                      </dt>
                      <dd className="mt-1 truncate text-[13.5px] font-semibold text-ink-900">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="border-t border-ink-900/[0.08] pt-5">
                <FieldLabel htmlFor="academic-year">Enrollment year</FieldLabel>
                <select
                  id="academic-year"
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className={selectClass}
                >
                  <option value="">Choose academic year</option>
                  <option value="1">1st year · Semester 1 &amp; 2</option>
                  <option value="2">2nd year · Semester 3 &amp; 4</option>
                  <option value="3">3rd year · Semester 5 &amp; 6</option>
                  <option value="4">4th year · Semester 7 &amp; 8</option>
                </select>

                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50 px-3.5 py-3">
                  <Sparkles size={15} className="mt-px shrink-0 text-brand-600" />
                  <p className="text-[12px] leading-relaxed text-brand-700">
                    Once the transaction is verified, an official college receipt is
                    generated and emailed to your registered student address.
                  </p>
                </div>
              </div>
            </div>
<div className="flex flex-col justify-between gap-6 border-t border-ink-900/[0.08] bg-ink-900 p-5 text-white sm:p-6 lg:border-l lg:border-t-0">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/45">
                  Total payable
                </p>
                <p className="mt-2.5 font-display text-[32px] font-extrabold leading-none tracking-tight">
                  ₹{calculatedFee.toLocaleString()}
                </p>
                <p className="mt-2 text-[12px] font-medium text-white/55">
                  Per academic year · includes labs and evaluation
                </p>

                <dl className="mt-6 space-y-2.5 border-t border-white/10 pt-5 text-[12.5px]">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-white/60">Tuition &amp; instruction</dt>
                    <dd className="font-semibold">
                      ₹{(calculatedFee * 0.8).toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-white/60">Virtual classroom &amp; AI labs</dt>
                    <dd className="font-semibold">
                      ₹{(calculatedFee * 0.15).toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-white/60">Library &amp; evaluation</dt>
                    <dd className="font-semibold">
                      ₹{(calculatedFee * 0.05).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePay}
                  disabled={loading || !year}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-[13.5px] font-bold text-ink-900 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Initiating payment…
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      Proceed to secure payment
                    </>
                  )}
                </button>
                <p className="flex items-center justify-center gap-1.5 text-[11.5px] font-medium text-white/45">
                  <CheckCircle2 size={13} />
                  No card details are stored on EduMatrix servers
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 size={26} className="animate-spin text-brand-600" />
            <p className="text-[13px] font-semibold text-ink-600">
              Loading your tuition ledger…
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Layout()(Payfees);