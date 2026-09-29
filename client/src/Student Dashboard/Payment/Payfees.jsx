/*
Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  GraduationCap,
  HelpCircle,
  Info,
  Layers,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  Badge,
  Card,
  CardHeader,
  FieldLabel,
  PageHeader,
  selectClass,
} from "../Shared/ui";

const Payfees = () => {
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [explainOpen, setExplainOpen] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchLedger = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const response = await axios.get(`${backendUrl}/api/v10/fees/ledger`, {
        headers: { token: localStorage.getItem("token") },
      });

      setLedgerData(response.data);

      if (response.data?.years && response.data.years.length > 0) {
        // Auto-select the first year that has outstanding dues, or the current year
        const firstDueYear = response.data.years.find((y) => y.dueAmount > 0);
        if (firstDueYear) {
          setSelectedYear(String(firstDueYear.academicYear));
        } else if (response.data.academicProgression?.currentAcademicYear) {
          setSelectedYear(
            String(response.data.academicProgression.currentAcademicYear)
          );
        } else {
          setSelectedYear(String(response.data.years[0].academicYear));
        }
      }
    } catch (err) {
      console.error("Ledger fetch error:", err);
      setFetchError(
        err.response?.data?.message || "Failed to load fee ledger."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [backendUrl]);

  const handlePay = async () => {
    if (!selectedYear) return alert("Please select an academic year.");
    try {
      setPayLoading(true);
      const url = `${backendUrl}/api/v10/payfees`;
      const response = await axios.post(
        url,
        {
          year: Number(selectedYear),
        },
        { headers: { token: localStorage.getItem("token") } }
      );
      if (response.data.success && response.data.url) {
        window.location.replace(response.data.url);
      } else {
        alert(response.data.message || "Unable to initiate payment.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.response?.data?.message || "Payment initiation failed.");
    } finally {
      setPayLoading(false);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          chip="FINANCE"
          chipLabel="Fee & Ledger Gateway"
          title="Student Fee Account"
          description="Fetching your authoritative academic progression and fee ledger from the university server…"
        />
        <Card className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <Loader2 size={32} className="animate-spin text-brand-600" />
          <p className="font-display text-[15px] font-bold text-ink-900">
            Loading your fee ledger…
          </p>
          <p className="text-[12.5px] text-ink-500">
            Calculating academic progression and verified payment history
          </p>
        </Card>
      </div>
    );
  }

  // 2. Fetch Network Error State
  if (fetchError) {
    return (
      <div className="space-y-6">
        <PageHeader
          chip="FINANCE"
          chipLabel="Fee & Ledger Gateway"
          title="Student Fee Account"
          description="Institutional financial ledger and online payment gateway."
        />
        <Card className="border-rose-200 bg-rose-50/50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <AlertCircle size={28} className="shrink-0 text-rose-600" />
            <div className="space-y-2">
              <h3 className="font-display text-base font-bold text-rose-950">
                Unable to load fee ledger
              </h3>
              <p className="text-[13px] text-rose-700">{fetchError}</p>
              <button
                onClick={fetchLedger}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-[12.5px] font-bold text-white transition hover:bg-rose-700"
              >
                <RefreshCw size={14} /> Retry Connection
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 3. Unresolved Academic Affiliation State
  if (ledgerData?.status === "UNRESOLVED" || !ledgerData?.success) {
    const student = ledgerData?.student;
    return (
      <div className="space-y-6">
        <PageHeader
          chip="FINANCE"
          chipLabel="Status: Unresolved"
          title="Student Fee Account"
          description="Institutional academic enrollment and fee structure resolution."
        />

        <Card className="border-amber-200 bg-amber-50/40 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <AlertTriangle size={32} className="shrink-0 text-amber-600" />
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-lg font-bold text-amber-950">
                  Fee Information Unavailable
                </h3>
                <p className="mt-1 text-[13.5px] leading-relaxed text-amber-800">
                  We could not determine your current academic enrollment or institutional fee structure.
                </p>
              </div>

              <div className="rounded-xl border border-amber-200/80 bg-white/80 p-4">
                <p className="text-[11.5px] font-bold uppercase tracking-wider text-amber-700">
                  Reason for Unresolved Status
                </p>
                <p className="mt-1 text-[13px] font-medium text-ink-900">
                  {ledgerData?.reason ||
                    "Institution affiliation or academic batch details are missing or unassigned."}
                </p>
              </div>

              {student ? (
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-400">
                    Recorded Profile Data
                  </p>
                  <div className="mt-2 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:grid-cols-4">
                    <div className="rounded-lg bg-white/60 p-2.5">
                      <span className="text-[11px] text-ink-500">Name</span>
                      <p className="break-words text-[13px] font-bold text-ink-900">
                        {student.name}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-2.5">
                      <span className="text-[11px] text-ink-500">Roll No</span>
                      <p className="break-words text-[13px] font-bold text-ink-900">
                        {student.rollNo}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-2.5">
                      <span className="text-[11px] text-ink-500">Department</span>
                      <p className="break-words text-[13px] font-bold text-ink-900">
                        {student.branch}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-2.5">
                      <span className="text-[11px] text-ink-500">Batch</span>
                      <p className="break-words text-[13px] font-bold text-ink-900">
                        {student.batch}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="rounded-xl border border-amber-200 bg-amber-100/70 p-4 text-[12.5px] text-amber-900">
                <strong>Next Step:</strong> Please contact your institution registrar or administrator to verify that your student profile is linked to an authorized Institution and that active fee structures are configured for your department and batch cohort.
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 4. Resolved State
  const student = ledgerData.student;
  const progression = ledgerData.academicProgression;
  const summary = ledgerData.financialSummary;
  const years = ledgerData.years || [];
  const institution = ledgerData.institution || { id: null, name: null };

  const selectedYearObj =
    years.find((y) => String(y.academicYear) === String(selectedYear)) ||
    years[0] ||
    null;

  const isUnassessed = summary.totalAssessed === 0 || summary.status === "NOT_ASSESSED";
  const isZeroDue = summary.totalAssessed > 0 && summary.outstandingBalance === 0;

  // Determine if the selected year has prior unsettled academic session arrears
  const selectedYearNum = selectedYearObj ? Number(selectedYearObj.academicYear) : 1;
  const priorUnsettledYear = years.find(
    (y) => y.academicYear < selectedYearNum && y.dueAmount > 0
  );
  const hasPriorArrears = Boolean(priorUnsettledYear);

  return (
    <div className="space-y-6">
      <PageHeader
        chip="FINANCE"
        chipLabel="Authoritative Ledger Gateway"
        title="Student Fee Account"
        description="Real-time institutional ledger showing dynamic academic progression, assessed obligations, and verified payment history."
        actions={
          <Badge tone="success" icon={ShieldCheck}>
            Server-Authoritative Ledger
          </Badge>
        }
      />

      {/* Institution Identity Banner — server-authoritative, never from client */}
      {institution.name ? (
        <Card className="flex items-center gap-4 border-brand-200 bg-gradient-to-r from-brand-50 to-white p-4 sm:p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600">
            <Building2 size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-brand-500">
              Institution
            </p>
            <p className="mt-0.5 truncate font-display text-[15px] font-bold text-ink-900">
              {institution.name}
            </p>
          </div>
          <Badge tone="success" icon={ShieldCheck} className="shrink-0 text-[11px]">
            Verified
          </Badge>
        </Card>
      ) : (
        <Card className="flex items-center gap-3 border-rose-200 bg-rose-50 p-4">
          <AlertCircle size={18} className="shrink-0 text-rose-500" />
          <p className="text-[12.5px] text-rose-800">
            <strong>Institution not linked.</strong> Your student profile does not have an authoritative institution assignment. Please contact your registrar — do not attempt payment until resolved.
          </p>
        </Card>
      )}

      {/* Academic Progression Banner */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <GraduationCap size={16} />
              </span>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-400">
                Academic Progression Profile
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold text-ink-900">
                {student.name}
              </h2>
              <p className="text-[12.5px] font-medium text-ink-500">
                Roll No: <span className="font-semibold text-ink-700">{student.rollNo}</span> · Dept:{" "}
                <span className="font-semibold text-ink-700">{student.branch}</span> · Cohort:{" "}
                <span className="font-semibold text-ink-700">{student.batch}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:grid-cols-4 sm:gap-3 lg:gap-4">
            <div className="rounded-xl border border-ink-900/[0.08] bg-white p-3">
              <p className="text-[10.5px] font-semibold text-ink-400 uppercase tracking-wider">
                Admission Year
              </p>
              <p className="mt-1 font-display text-[15px] font-bold text-ink-900">
                {progression.admissionYear}
              </p>
            </div>
            <div className="rounded-xl border border-ink-900/[0.08] bg-white p-3">
              <p className="text-[10.5px] font-semibold text-ink-400 uppercase tracking-wider">
                Current Standing
              </p>
              <p className="mt-1 font-display text-[15px] font-bold text-brand-600">
                {progression.isGraduated
                  ? "Graduated"
                  : `Year ${progression.currentAcademicYear} of ${progression.courseDuration}`}
              </p>
            </div>
            <div className="rounded-xl border border-ink-900/[0.08] bg-white p-3">
              <p className="text-[10.5px] font-semibold text-ink-400 uppercase tracking-wider">
                Current Session
              </p>
              <p className="mt-1 font-display text-[15px] font-bold text-ink-900">
                {progression.currentSessionLabel}
              </p>
            </div>
            <div className="rounded-xl border border-ink-900/[0.08] bg-white p-3">
              <p className="text-[10.5px] font-semibold text-ink-400 uppercase tracking-wider">
                Course Duration
              </p>
              <p className="mt-1 font-display text-[15px] font-bold text-ink-900">
                {progression.courseDuration} Years
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Financial Summary Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Assessed */}
        <Card className="p-5">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-400">
            Total Assessed
          </p>
          <p className="mt-2 font-display text-2xl font-extrabold text-ink-900">
            ₹{summary.totalAssessed.toLocaleString()}
          </p>
          <p className="mt-1 text-[12px] text-ink-500">
            {summary.feeStructuresConfiguredCount === 0
              ? "Fee structure pending configuration"
              : `Obligations across ${years.length} assessed year(s)`}
          </p>
        </Card>

        {/* Card 2: Total Paid */}
        <Card className="p-5">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-400">
            Total Paid
          </p>
          <p className="mt-2 font-display text-2xl font-extrabold text-emerald-600">
            ₹{summary.totalPaid.toLocaleString()}
          </p>
          <p className="mt-1 text-[12px] text-ink-500">
            Verified gateway transactions
          </p>
        </Card>

        {/* Card 3: Outstanding Balance */}
        <Card className="p-5">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-400">
            Pending Due
          </p>
          <p
            className={`mt-2 font-display text-2xl font-extrabold ${
              isZeroDue ? "text-emerald-600" : isUnassessed ? "text-ink-600" : "text-rose-600"
            }`}
          >
            ₹{summary.outstandingBalance.toLocaleString()}
          </p>
          <p className="mt-1 text-[12px] text-ink-500">
            {isUnassessed
              ? "No obligations assessed"
              : isZeroDue
              ? "All assessed fees settled"
              : "Outstanding payable balance"}
          </p>
        </Card>

        {/* Card 4: Ledger Status */}
        <Card className="flex flex-col justify-between p-5">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-400">
              Account Status
            </p>
            <div className="mt-2">
              {summary.status === "PAID" ? (
                <Badge tone="success" icon={CheckCircle2} className="px-3 py-1 text-[12px]">
                  All Fees Paid
                </Badge>
              ) : summary.status === "PARTIALLY_PAID" ? (
                <Badge tone="warn" icon={AlertCircle} className="px-3 py-1 text-[12px]">
                  Partially Paid
                </Badge>
              ) : summary.status === "NOT_ASSESSED" ? (
                <Badge tone="neutral" icon={Info} className="px-3 py-1 text-[12px]">
                  Not Assessed
                </Badge>
              ) : (
                <Badge tone="danger" icon={AlertCircle} className="px-3 py-1 text-[12px]">
                  Payment Pending
                </Badge>
              )}
            </div>
          </div>
          <p className="mt-2 text-[11.5px] text-ink-400">
            {summary.status === "PAID"
              ? "Zero dues outstanding"
              : summary.status === "NOT_ASSESSED"
              ? "Fee structure unconfigured"
              : summary.outstandingBalance > 0
              ? "Payment required"
              : "Ledger up to date"}
          </p>
        </Card>
      </div>

      {/* Dues Segregation: Current Year vs Historical Arrears */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between border-b border-ink-900/[0.08] pb-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400">
                Current Academic Year Dues
              </p>
              <h3 className="font-display text-[15px] font-bold text-ink-900">
                Year {progression.currentAcademicYear} ({progression.currentSessionLabel})
              </h3>
            </div>
            <span
              className={`font-display text-lg font-extrabold ${
                summary.currentYearFee > 0 && summary.currentYearDue === 0
                  ? "text-emerald-600"
                  : summary.currentYearDue > 0
                  ? "text-rose-600"
                  : "text-ink-600"
              }`}
            >
              ₹{summary.currentYearDue.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[12.5px] text-ink-600">
            <span>Year Obligation: ₹{summary.currentYearFee.toLocaleString()}</span>
            <span>Paid so far: ₹{summary.currentYearPaid.toLocaleString()}</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between border-b border-ink-900/[0.08] pb-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400">
                Previous Years' Outstanding Arrears
              </p>
              <h3 className="font-display text-[15px] font-bold text-ink-900">
                Historical Sessions Prior to Year {progression.currentAcademicYear}
              </h3>
            </div>
            <span
              className={`font-display text-lg font-extrabold ${
                summary.previousYearsFee > 0 && summary.previousYearsDue === 0
                  ? "text-emerald-600"
                  : summary.previousYearsDue > 0
                  ? "text-amber-600"
                  : "text-ink-600"
              }`}
            >
              ₹{summary.previousYearsDue.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[12.5px] text-ink-600">
            <span>Prior Obligations: ₹{summary.previousYearsFee.toLocaleString()}</span>
            <span>Prior Paid: ₹{summary.previousYearsPaid.toLocaleString()}</span>
          </div>
        </Card>
      </div>

      {/* Main Ledger & Payment Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left Column: Year-by-Year Ledger Breakdown & Explainability */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader
              title="Year-by-Year Academic Ledger"
              description="Detailed record of assessed fees, payments, and balances across each academic year."
            />
            <div className="divide-y divide-ink-900/[0.08]">
              {years.map((y) => (
                <div key={y.academicYear} className="p-4 sm:p-5 transition hover:bg-ink-50/50">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-100 font-display text-[13px] font-extrabold text-ink-800">
                        Y{y.academicYear}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-[14px] font-bold text-ink-900">
                            Academic Year {y.academicYear}
                          </h4>
                          {y.isCurrentYear ? (
                            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10.5px] font-bold text-brand-700 border border-brand-200">
                              Current Session
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[12px] text-ink-500">
                          Session: {y.academicSession}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {y.status === "PAID" ? (
                        <Badge tone="success" icon={Check} className="py-0.5">
                          Paid
                        </Badge>
                      ) : y.status === "PARTIALLY_PAID" ? (
                        <Badge tone="warn" className="py-0.5">
                          Partial
                        </Badge>
                      ) : y.status === "NOT_ASSESSED" ? (
                        <Badge tone="neutral" icon={Info} className="py-0.5">
                          Not Assessed
                        </Badge>
                      ) : (
                        <Badge tone="danger" className="py-0.5">
                          Unpaid
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Amounts breakdown */}
                  <div className="mt-3.5 grid grid-cols-1 gap-2 rounded-xl bg-ink-50/60 p-3 min-[420px]:grid-cols-3 min-[420px]:p-2.5 min-[420px]:text-center sm:text-left">
                    <div>
                      <span className="text-[10.5px] font-semibold text-ink-400 uppercase">
                        Assessed
                      </span>
                      <p className="text-[13px] font-bold text-ink-900">
                        ₹{y.netAssessed.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10.5px] font-semibold text-ink-400 uppercase">
                        Paid
                      </span>
                      <p className="text-[13px] font-bold text-emerald-600">
                        ₹{y.paidAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10.5px] font-semibold text-ink-400 uppercase">
                        Due
                      </span>
                      <p
                        className={`text-[13px] font-bold ${
                          y.netAssessed > 0 && y.dueAmount === 0
                            ? "text-emerald-600"
                            : y.dueAmount > 0
                            ? "text-rose-600"
                            : "text-ink-600"
                        }`}
                      >
                        ₹{y.dueAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Components or Unconfigured notice */}
                  {!y.feeStructureConfigured ? (
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-amber-700">
                      <Info size={13} className="shrink-0 text-amber-600" />
                      <span>
                        Fee structure pending configuration by institution for this academic session.
                      </span>
                    </div>
                  ) : y.components && y.components.length > 0 ? (
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-ink-500">
                      <span className="font-semibold text-ink-400">Components:</span>
                      {y.components.map((c, i) => (
                        <span key={i}>
                          {c.name}: <strong className="text-ink-700">₹{c.amount.toLocaleString()}</strong>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>

          {/* Explainability Accordion: "Why do I owe this amount?" */}
          <Card className="overflow-hidden">
            <button
              onClick={() => setExplainOpen(!explainOpen)}
              className="flex w-full items-center justify-between p-4 sm:p-5 text-left transition hover:bg-ink-50/60"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle size={18} className="text-brand-600" />
                <div>
                  <h3 className="font-display text-[14.5px] font-bold text-ink-900">
                    Why do I owe this amount?
                  </h3>
                  <p className="text-[12px] text-ink-500">
                    Transparent server-authoritative calculation breakdown
                  </p>
                </div>
              </div>
              {explainOpen ? (
                <ChevronUp size={18} className="text-ink-400" />
              ) : (
                <ChevronDown size={18} className="text-ink-400" />
              )}
            </button>

            {explainOpen ? (
              <div className="border-t border-ink-900/[0.08] bg-ink-50/40 p-5 space-y-4 text-[12.5px] text-ink-700">
                <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-3.5">
                  <p className="font-semibold text-brand-900">
                    {summary.explainability?.summaryText ||
                      "Your obligations are computed dynamically based on your admitted cohort and current academic session."}
                  </p>
                  <p className="mt-1 text-[11.5px] text-brand-700">
                    {summary.explainability?.calculationBasis ||
                      "Assessed across all academic sessions from admission to date."}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-ink-900">
                    Calculation Principles:
                  </p>
                  <ul className="list-inside list-disc space-y-1.5 text-ink-600 pl-1">
                    <li>
                      <strong>Academic Progression:</strong> Admitted in batch{" "}
                      <code className="rounded bg-ink-100 px-1 font-mono text-[11px]">
                        {student.batch}
                      </code>
                      . Every institution-configured academic session boundary automatically activates assessment for the new academic year up to course duration.
                    </li>
                    <li>
                      <strong>Institution-Authoritative Pricing:</strong> Tuition and administrative fees are looked up directly from active institutional fee structures for{" "}
                      <code className="rounded bg-ink-100 px-1 font-mono text-[11px]">
                        {student.branch}
                      </code>
                      .
                    </li>
                    <li>
                      <strong>Verified Payments:</strong> Only completed, Stripe-verified payments in the central ledger are credited toward obligations.
                    </li>
                    <li>
                      <strong>Formula:</strong>{" "}
                      <span className="font-mono text-[11px] text-ink-800">
                        Net Due = Assessed (Tuition + Admin/Lab) - Concessions - Verified Payments
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : null}
          </Card>
        </div>

        {/* Right Column: Payment Initiation Action */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader
              title="Settle Academic Fees"
              description="Select academic year to initiate a verified transaction."
            />

            <div className="p-5 sm:p-6 space-y-5">
              {isUnassessed ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-6 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-700">
                    <Info size={24} />
                  </div>
                  <div>
                    <h4 className="font-display text-[15px] font-bold text-amber-950">
                      Fee Structure Pending Configuration
                    </h4>
                    <p className="mt-1 text-[12.5px] text-amber-800">
                      Your institution has not published active fee structures for {student.branch}. No fee obligations are currently payable online. Please contact your college administration.
                    </p>
                  </div>
                </div>
              ) : isZeroDue ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-display text-[15px] font-bold text-emerald-950">
                      Fees Fully Settled
                    </h4>
                    <p className="mt-1 text-[12.5px] text-emerald-800">
                      All assessed academic obligations through your current session have been paid in full. No payment is currently pending.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <FieldLabel htmlFor="pay-year">Select Academic Year</FieldLabel>
                    <select
                      id="pay-year"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className={selectClass}
                    >
                      {years.map((y) => (
                        <option key={y.academicYear} value={String(y.academicYear)}>
                          Year {y.academicYear} ({y.academicSession}) ·{" "}
                          {!y.feeStructureConfigured
                            ? "Not Assessed"
                            : y.dueAmount === 0
                            ? "Paid"
                            : `Due: ₹${y.dueAmount.toLocaleString()}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedYearObj ? (
                    <div className="rounded-2xl border border-ink-900/[0.08] bg-ink-900 p-5 text-white">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/50">
                          Selected Obligation
                        </span>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/80">
                          Year {selectedYearObj.academicYear}
                        </span>
                      </div>

                      {/* Payment context — institution + program shown before amount */}
                      <div className="mt-3 space-y-1 border-b border-white/10 pb-3 text-[11.5px] text-white/60">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={12} className="shrink-0 text-white/40" />
                          <span className="font-semibold text-white/80">
                            {institution.name || "Institution not linked"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 pl-[20px]">
                          <span>
                            {student.branch} · {selectedYearObj.academicSession}
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 font-display text-3xl font-extrabold leading-none text-white">
                        ₹{selectedYearObj.dueAmount.toLocaleString()}
                      </p>
                      <p className="mt-1.5 text-[12px] text-white/60">
                        {!selectedYearObj.feeStructureConfigured
                          ? `Fee structure pending configuration for session ${selectedYearObj.academicSession}`
                          : selectedYearObj.dueAmount === 0
                          ? "This academic year has already been paid in full."
                          : `Outstanding due for session ${selectedYearObj.academicSession}`}
                      </p>

                      {selectedYearObj.components && selectedYearObj.components.length > 0 ? (
                        <dl className="mt-4 space-y-1.5 border-t border-white/10 pt-3 text-[12px]">
                          {selectedYearObj.components.map((c, i) => (
                            <div key={i} className="flex justify-between text-white/70">
                              <span>{c.name}</span>
                              <span className="font-semibold text-white">
                                ₹{c.amount.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </dl>
                      ) : null}

                      {hasPriorArrears ? (
                        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-500/20 p-3 text-[12px] text-amber-200">
                          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-400" />
                          <span>
                            Prior Academic Year {priorUnsettledYear.academicYear} has outstanding arrears of ₹{priorUnsettledYear.dueAmount.toLocaleString()}. Please clear earlier sessions first to comply with institutional chronological settlement policy.
                          </span>
                        </div>
                      ) : null}

                      <div className="mt-6">
                        <button
                          onClick={handlePay}
                          disabled={
                            payLoading ||
                            !selectedYearObj.feeStructureConfigured ||
                            selectedYearObj.dueAmount === 0 ||
                            hasPriorArrears
                          }
                          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-[13.5px] font-bold text-ink-900 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {payLoading ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Connecting to gateway…
                            </>
                          ) : !selectedYearObj.feeStructureConfigured ? (
                            <>
                              <Info size={15} className="text-amber-600" />
                              Fee Structure Unconfigured
                            </>
                          ) : selectedYearObj.dueAmount === 0 ? (
                            <>
                              <CheckCircle2 size={16} className="text-emerald-600" />
                              Year Already Paid
                            </>
                          ) : hasPriorArrears ? (
                            <>
                              <AlertTriangle size={15} className="text-amber-600" />
                              Settle Year {priorUnsettledYear.academicYear} Arrears First
                            </>
                          ) : (
                            <>
                              <Lock size={15} />
                              Pay ₹{selectedYearObj.dueAmount.toLocaleString()}
                            </>
                          )}
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-white/45">
                        <ShieldCheck size={13} />
                        Amount verified &amp; authorized by institution server
                      </div>
                    </div>
                  ) : null}
                </>
              )}

              <div className="flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50 p-3.5">
                <Sparkles size={16} className="mt-0.5 shrink-0 text-brand-600" />
                <p className="text-[12px] leading-relaxed text-brand-700">
                  Upon Stripe confirmation, your Student Fee Account ledger is automatically updated in real time, and an official university payment confirmation is generated.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Layout()(Payfees);