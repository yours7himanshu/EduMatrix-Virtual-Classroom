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

import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AppLayout from "../../layout/AppLayout";
import { RoleContext } from "../../context/RoleContext";
import {
  Button,
  Card,
  CardHeader,
  FormField,
  TextInput,
  Select,
  Badge,
  EmptyState,
} from "../../shared/ui";
import {
  ShieldAlert,
  Plus,
  RefreshCw,
  Trash2,
  Power,
  Layers,
  CheckCircle,
  Building,
  DollarSign,
  X,
  Loader2,
} from "lucide-react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const STANDARD_BRANCHES = [
  { value: "CSE", label: "Computer Science & Engineering (CSE)" },
  { value: "IT", label: "Information Technology (IT)" },
  { value: "ECE", label: "Electronics & Communication (ECE)" },
  { value: "ME", label: "Mechanical Engineering (ME)" },
  { value: "CE", label: "Civil Engineering (CE)" },
  { value: "EE", label: "Electrical Engineering (EE)" },
  { value: "CUSTOM", label: "+ Other / Custom Department..." },
];

const FeeStructureManagement = () => {
  const { userRole } = useContext(RoleContext);
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [selectedBranch, setSelectedBranch] = useState("CSE");
  const [customBranch, setCustomBranch] = useState("");
  const [academicYear, setAcademicYear] = useState("1");
  const [tuitionFee, setTuitionFee] = useState("");
  const [additionalFee, setAdditionalFee] = useState("2000");
  const [isActive, setIsActive] = useState(true);

  // Itemized components state
  const [components, setComponents] = useState([
    { code: "TUITION", name: "Tuition & Instruction", amount: "" },
    { code: "ADMIN_LAB", name: "Lab & Tech Infrastructure", amount: "2000" },
  ]);

  const fetchFeeStructures = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${backendUrl}/api/v10/admin/fee-structures`,
        {
          headers: { token },
          withCredentials: true,
        }
      );
      if (response.data?.success) {
        setFeeStructures(response.data.feeStructures || []);
      }
    } catch (error) {
      console.error("Failed to load fee structures:", error);
      if (error.response?.status !== 403) {
        toast.error(
          error.response?.data?.message || "Failed to load fee structures."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "Registrar") {
      fetchFeeStructures();
    } else {
      setLoading(false);
    }
  }, [userRole]);

  // Synchronize component amounts when tuition or additional fee changes
  const handleTuitionChange = (val) => {
    setTuitionFee(val);
    setComponents((prev) =>
      prev.map((c) =>
        c.code === "TUITION" ? { ...c, amount: val } : c
      )
    );
  };

  const handleAdditionalChange = (val) => {
    setAdditionalFee(val);
    setComponents((prev) =>
      prev.map((c) =>
        c.code === "ADMIN_LAB" ? { ...c, amount: val } : c
      )
    );
  };

  const handleAddComponent = () => {
    setComponents((prev) => [
      ...prev,
      { code: `COMPONENT_${prev.length + 1}`, name: "New Fee Head", amount: "0" },
    ]);
  };

  const handleRemoveComponent = (index) => {
    setComponents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleComponentChange = (index, field, value) => {
    setComponents((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    const finalBranch =
      selectedBranch === "CUSTOM" ? customBranch.trim() : selectedBranch;

    if (!finalBranch) {
      return toast.warn("Please specify a department / branch.");
    }
    if (!tuitionFee || Number(tuitionFee) < 0) {
      return toast.warn("Please enter a valid tuition fee.");
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const payload = {
        branch: finalBranch,
        academicYear: Number(academicYear),
        tuitionFee: Number(tuitionFee),
        additionalFee: Number(additionalFee) || 0,
        components: components.map((c) => ({
          code: c.code,
          name: c.name,
          amount: Number(c.amount) || 0,
        })),
        currency: "inr",
        isActive,
      };

      const response = await axios.post(
        `${backendUrl}/api/v10/admin/fee-structures`,
        payload,
        {
          headers: { token },
          withCredentials: true,
        }
      );

      if (response.data?.success) {
        toast.success(response.data.message);
        setShowModal(false);
        setTuitionFee("");
        setAdditionalFee("2000");
        setCustomBranch("");
        fetchFeeStructures();
      }
    } catch (error) {
      console.error("Publish fee structure error:", error);
      toast.error(
        error.response?.data?.message || "Failed to publish fee structure."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${backendUrl}/api/v10/admin/fee-structures/${id}/toggle-active`,
        { isActive: !currentStatus },
        {
          headers: { token },
          withCredentials: true,
        }
      );
      if (response.data?.success) {
        toast.success(response.data.message);
        setFeeStructures((prev) =>
          prev.map((s) => (s._id === id ? { ...s, isActive: !currentStatus } : s))
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update status."
      );
    }
  };

  const handleDelete = async (id, branch, year) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete the fee structure for ${branch} (Year ${year})?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${backendUrl}/api/v10/admin/fee-structures/${id}`,
        {
          headers: { token },
          withCredentials: true,
        }
      );
      if (response.data?.success) {
        toast.success(response.data.message);
        setFeeStructures((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete fee structure."
      );
    }
  };

  // 1. Non-Registrar Access Safeguard
  if (userRole && userRole !== "Registrar") {
    return (
      <div className="w-full min-h-screen py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <Card className="max-w-lg w-full p-8 text-center border-amber-200 bg-amber-50/50">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-xl font-bold text-admin-slate-900 tracking-tight">
            Registrar Access Required
          </h2>
          <p className="mt-2 text-sm text-admin-slate-600 leading-relaxed">
            Institutional fee structure configuration is restricted exclusively to the{" "}
            <strong>Registrar</strong> role.
          </p>
          <div className="mt-4 inline-block bg-white px-3 py-1.5 rounded-lg border border-amber-200 text-xs font-semibold text-amber-800">
            Current Authenticated Role: {userRole}
          </div>
        </Card>
      </div>
    );
  }

  const activeCount = feeStructures.filter((s) => s.isActive).length;
  const distinctBranches = Array.from(new Set(feeStructures.map((s) => s.branch)));

  return (
    <div className="w-full min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-admin-slate-900 tracking-tight">
            Fee Structure Management
          </h1>
          <p className="text-sm text-admin-slate-500 mt-1">
            Authoritative institutional tariffs and year-wise departmental fee definitions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={fetchFeeStructures}
            leftIcon={RefreshCw}
            isLoading={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowModal(true)}
            leftIcon={Plus}
          >
            Publish Fee Structure
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="sm" className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-admin-brand-50 text-admin-brand-600">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-admin-slate-400">
              Published Structures
            </p>
            <p className="text-2xl font-bold text-admin-slate-900 mt-0.5">
              {feeStructures.length}
            </p>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-admin-slate-400">
              Active Configurations
            </p>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5">
              {activeCount}
            </p>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
            <Building size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-admin-slate-400">
              Configured Departments
            </p>
            <p className="text-2xl font-bold text-sky-700 mt-0.5">
              {distinctBranches.length}
            </p>
          </div>
        </Card>
      </div>

      {/* Fee Structures Table / Empty State */}
      <Card padding="none" className="overflow-hidden shadow-admin-sm">
        <div className="px-6 py-4 border-b border-admin-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-admin-slate-900">
              Configured Departmental Fees
            </h2>
            <p className="text-xs text-admin-slate-500 mt-0.5">
              Live pricing structures currently enforced during student ledger assessment.
            </p>
          </div>
          <Badge tone="brand" size="sm">
            {feeStructures.length} Recorded
          </Badge>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-admin-brand-600" />
            <p className="text-sm font-medium text-admin-slate-600">
              Loading institutional fee structures…
            </p>
          </div>
        ) : feeStructures.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Fee Structures Configured"
              description="Your institution has not published any departmental fee structures yet. Students currently cannot be assessed fees until fee structures are configured."
              action={
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowModal(true)}
                  leftIcon={Plus}
                >
                  Publish First Fee Structure
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-admin-slate-700">
              <thead className="bg-admin-slate-50 border-b border-admin-slate-200/70 text-xs uppercase font-bold text-admin-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Academic Year</th>
                  <th className="px-6 py-3.5">Tuition Fee</th>
                  <th className="px-6 py-3.5">Admin / Lab Fee</th>
                  <th className="px-6 py-3.5">Total Assessment</th>
                  <th className="px-6 py-3.5">Components</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-slate-100">
                {feeStructures.map((s) => {
                  const total = (Number(s.tuitionFee) || 0) + (Number(s.additionalFee) || 0);
                  return (
                    <tr
                      key={s._id}
                      className="hover:bg-admin-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-admin-slate-900">
                        {s.branch}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-admin-brand-50 text-admin-brand-700 border border-admin-brand-200">
                          Year {s.academicYear}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-admin-slate-900">
                        ₹{(s.tuitionFee || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-admin-slate-600">
                        ₹{(s.additionalFee || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-700">
                        ₹{total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs text-admin-slate-500">
                        {s.components && s.components.length > 0 ? (
                          <span>{s.components.length} Itemized Heads</span>
                        ) : (
                          <span>Standard Tuition</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {s.isActive ? (
                          <Badge tone="success" size="sm">
                            Active
                          </Badge>
                        ) : (
                          <Badge tone="neutral" size="sm">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            title={s.isActive ? "Deactivate" : "Activate"}
                            onClick={() => handleToggleStatus(s._id, s.isActive)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              s.isActive
                                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            <Power size={14} />
                          </button>
                          <button
                            title="Delete Fee Structure"
                            onClick={() => handleDelete(s._id, s.branch, s.academicYear)}
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Publish Fee Structure Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-admin-slate-100 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-admin-slate-100 bg-admin-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-admin-slate-900">
                  Publish Institutional Fee Structure
                </h3>
                <p className="text-xs text-admin-slate-500 mt-0.5">
                  Set authoritative tuition and fee components for a department cohort.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-admin-slate-400 hover:text-admin-slate-700 hover:bg-admin-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePublish} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Department / Branch" id="fee-branch" required>
                  <Select
                    id="fee-branch"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    options={STANDARD_BRANCHES}
                  />
                </FormField>

                <FormField label="Academic Year" id="fee-year" required>
                  <Select
                    id="fee-year"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    options={[
                      { value: "1", label: "Year 1 (1st Year)" },
                      { value: "2", label: "Year 2 (2nd Year)" },
                      { value: "3", label: "Year 3 (3rd Year)" },
                      { value: "4", label: "Year 4 (4th Year)" },
                    ]}
                  />
                </FormField>
              </div>

              {selectedBranch === "CUSTOM" && (
                <FormField
                  label="Custom Department Code"
                  id="custom-branch"
                  required
                  hint="Enter standardized uppercase code, e.g. BIOTECH, AI_DS, BBA"
                >
                  <TextInput
                    id="custom-branch"
                    value={customBranch}
                    onChange={(e) => setCustomBranch(e.target.value.toUpperCase())}
                    placeholder="e.g. AI_ML"
                  />
                </FormField>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Annual Tuition Fee (₹)"
                  id="fee-tuition"
                  required
                  hint="Base instruction tariff"
                >
                  <TextInput
                    id="fee-tuition"
                    type="number"
                    min="0"
                    value={tuitionFee}
                    onChange={(e) => handleTuitionChange(e.target.value)}
                    placeholder="e.g. 150000"
                  />
                </FormField>

                <FormField
                  label="Administrative & Lab Fee (₹)"
                  id="fee-additional"
                  hint="Tech infrastructure & lab heads"
                >
                  <TextInput
                    id="fee-additional"
                    type="number"
                    min="0"
                    value={additionalFee}
                    onChange={(e) => handleAdditionalChange(e.target.value)}
                    placeholder="e.g. 2000"
                  />
                </FormField>
              </div>

              {/* Itemized Components Section */}
              <div className="space-y-2 pt-2 border-t border-admin-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-admin-slate-600">
                    Itemized Component Breakdown
                  </span>
                  <button
                    type="button"
                    onClick={handleAddComponent}
                    className="text-xs font-semibold text-admin-brand-600 hover:text-admin-brand-700 flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Component Head
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {components.map((c, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-admin-slate-50 p-2 rounded-xl border border-admin-slate-200/60"
                    >
                      <input
                        type="text"
                        className="w-1/3 text-xs bg-white border border-admin-slate-200 rounded-lg px-2 py-1 font-mono uppercase"
                        value={c.code}
                        onChange={(e) =>
                          handleComponentChange(idx, "code", e.target.value.toUpperCase())
                        }
                        placeholder="CODE"
                      />
                      <input
                        type="text"
                        className="flex-1 text-xs bg-white border border-admin-slate-200 rounded-lg px-2 py-1"
                        value={c.name}
                        onChange={(e) =>
                          handleComponentChange(idx, "name", e.target.value)
                        }
                        placeholder="Description"
                      />
                      <input
                        type="number"
                        className="w-24 text-xs bg-white border border-admin-slate-200 rounded-lg px-2 py-1 font-semibold text-right"
                        value={c.amount}
                        onChange={(e) =>
                          handleComponentChange(idx, "amount", e.target.value)
                        }
                        placeholder="Amount"
                      />
                      {components.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveComponent(idx)}
                          className="p-1 text-admin-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary Callout */}
              <div className="rounded-xl bg-admin-slate-50 p-3 flex items-center justify-between border border-admin-slate-200">
                <span className="text-xs font-semibold text-admin-slate-600">
                  Total Annual Assessment:
                </span>
                <span className="text-base font-extrabold text-emerald-700">
                  ₹
                  {(
                    (Number(tuitionFee) || 0) + (Number(additionalFee) || 0)
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-admin-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={actionLoading}
                >
                  Publish Fee Structure
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout()(FeeStructureManagement);
