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

import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Scatter, Doughnut } from "react-chartjs-2";
import {
  Loader,
  RefreshCw,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  AlertCircle,
  BarChart3,
} from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Curated modern color palette
const PALETTE = [
  { border: "#3B82F6", bg: "rgba(59, 130, 246, 0.75)" }, // Blue
  { border: "#8B5CF6", bg: "rgba(139, 92, 246, 0.75)" }, // Purple
  { border: "#10B981", bg: "rgba(16, 185, 129, 0.75)" }, // Emerald
  { border: "#F59E0B", bg: "rgba(245, 158, 11, 0.75)" }, // Amber
  { border: "#EC4899", bg: "rgba(236, 72, 153, 0.75)" }, // Pink
  { border: "#06B6D4", bg: "rgba(6, 182, 212, 0.75)" }, // Cyan
  { border: "#F97316", bg: "rgba(249, 115, 22, 0.75)" }, // Orange
  { border: "#6366F1", bg: "rgba(99, 102, 241, 0.75)" }, // Indigo
  { border: "#14B8A6", bg: "rgba(20, 184, 166, 0.75)" }, // Teal
  { border: "#EF4444", bg: "rgba(239, 68, 68, 0.75)" }, // Red
];

const Dashboard = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  const fetchCharts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/test`);
      if (response.data.success) {
        const payload = response.data.data || response.data.analysis;
        setAnalysisData(payload);
      } else {
        setError(response.data.message || "Failed to load analysis data");
      }
    } catch (err) {
      console.error("Error fetching analysis data:", err);
      setError(
        err.response?.data?.message ||
          "Could not connect to the analytics server. Please ensure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchCharts();
  }, [fetchCharts]);

  // 1. Scatter Chart: Attendance vs Marks (Points grouped by Branch)
  const scatterData = useMemo(() => {
    if (!analysisData?.scatter?.length || !analysisData?.branches?.length) return null;
    const datasets = analysisData.branches.map((branch, idx) => {
      const points = analysisData.scatter
        .filter((p) => p.branch === branch)
        .map((p) => ({
          x: p.x,
          y: p.y,
          name: p.name,
          rollNumber: p.rollNumber,
        }));
      const color = PALETTE[idx % PALETTE.length];
      return {
        label: branch,
        data: points,
        backgroundColor: color.bg,
        borderColor: color.border,
        borderWidth: 1.5,
        pointRadius: 5,
        pointHoverRadius: 8,
      };
    });
    return { datasets };
  }, [analysisData]);

  const scatterOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 10,
            usePointStyle: true,
            padding: 10,
            font: { size: 11 },
          },
        },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.95)",
          titleColor: "#ffffff",
          bodyColor: "#e5e7eb",
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            title: (items) => {
              if (!items.length) return "";
              const item = items[0].raw;
              return `${item.name || "Student"} (Roll: ${item.rollNumber || "N/A"})`;
            },
            label: (item) => {
              const raw = item.raw;
              return ` ${item.dataset.label} — Attendance: ${raw.x}%, Marks: ${raw.y}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Attendance (%)", font: { weight: "600", size: 12 } },
          min: 0,
          max: 100,
          grid: { color: "rgba(229, 231, 235, 0.6)" },
        },
        y: {
          title: { display: true, text: "Marks", font: { weight: "600", size: 12 } },
          min: 0,
          max: 100,
          grid: { color: "rgba(229, 231, 235, 0.6)" },
        },
      },
    }),
    []
  );

  // 2. Branchwise Student Distribution (Doughnut Chart)
  const pieData = useMemo(() => {
    if (!analysisData?.branchDistribution?.length) return null;
    return {
      labels: analysisData.branchDistribution.map((b) => b.branch),
      datasets: [
        {
          data: analysisData.branchDistribution.map((b) => b.count),
          backgroundColor: analysisData.branchDistribution.map(
            (_, idx) => PALETTE[idx % PALETTE.length].bg
          ),
          borderColor: analysisData.branchDistribution.map(
            (_, idx) => PALETTE[idx % PALETTE.length].border
          ),
          borderWidth: 1.5,
          hoverOffset: 8,
        },
      ],
    };
  }, [analysisData]);

  const pieOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 10,
            padding: 8,
            font: { size: 11 },
          },
        },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.95)",
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              const item = analysisData.branchDistribution[ctx.dataIndex];
              return ` ${item.count} Students (${item.percentage}%)`;
            },
          },
        },
      },
    }),
    [analysisData]
  );

  // 3. Attendance Overview (Horizontal Bar Chart with Max/Min Highlights)
  const attendanceData = useMemo(() => {
    if (!analysisData?.attendanceOverview?.length) return null;
    const values = analysisData.attendanceOverview.map((b) => b.meanAttendance);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);

    const bgColors = values.map((val) => {
      if (val === maxVal) return "rgba(16, 185, 129, 0.85)"; // High (Green)
      if (val === minVal) return "rgba(239, 68, 68, 0.85)";   // Low (Red)
      return "rgba(59, 130, 246, 0.8)";                     // Standard Blue
    });

    const borderColors = values.map((val) => {
      if (val === maxVal) return "#10B981";
      if (val === minVal) return "#EF4444";
      return "#3B82F6";
    });

    return {
      labels: analysisData.attendanceOverview.map((b) => b.branch),
      datasets: [
        {
          label: "Mean Attendance (%)",
          data: values,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };
  }, [analysisData]);

  const attendanceOptions = useMemo(
    () => ({
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.95)",
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => ` Mean Attendance: ${ctx.parsed.x}%`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Attendance (Mean %)", font: { weight: "600", size: 12 } },
          min: 0,
          max: 100,
          grid: { color: "rgba(229, 231, 235, 0.6)" },
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
        },
      },
    }),
    []
  );

  // 4. Marks Overview (Horizontal Bar Chart with Max/Min Highlights)
  const marksData = useMemo(() => {
    if (!analysisData?.marksOverview?.length) return null;
    const values = analysisData.marksOverview.map((b) => b.meanMarks);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);

    const bgColors = values.map((val) => {
      if (val === maxVal) return "rgba(16, 185, 129, 0.85)";
      if (val === minVal) return "rgba(239, 68, 68, 0.85)";
      return "rgba(139, 92, 246, 0.8)";
    });

    const borderColors = values.map((val) => {
      if (val === maxVal) return "#10B981";
      if (val === minVal) return "#EF4444";
      return "#8B5CF6";
    });

    return {
      labels: analysisData.marksOverview.map((b) => b.branch),
      datasets: [
        {
          label: "Mean Marks",
          data: values,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };
  }, [analysisData]);

  const marksOptions = useMemo(
    () => ({
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.95)",
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => ` Mean Marks: ${ctx.parsed.x} / 100`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Marks (Mean)", font: { weight: "600", size: 12 } },
          min: 0,
          max: 100,
          grid: { color: "rgba(229, 231, 235, 0.6)" },
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
        },
      },
    }),
    []
  );

  // 5. Top Students by Branch (Bar Chart)
  const topStudentsData = useMemo(() => {
    if (!analysisData?.topStudents?.length) return null;
    return {
      labels: analysisData.topStudents.map((s) => s.branch),
      datasets: [
        {
          label: "Highest Marks",
          data: analysisData.topStudents.map((s) => s.marks),
          backgroundColor: analysisData.topStudents.map(
            (_, idx) => PALETTE[idx % PALETTE.length].bg
          ),
          borderColor: analysisData.topStudents.map(
            (_, idx) => PALETTE[idx % PALETTE.length].border
          ),
          borderWidth: 1.5,
          borderRadius: 6,
        },
      ],
    };
  }, [analysisData]);

  const topStudentsOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.95)",
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            title: (items) => {
              if (!items.length) return "";
              const student = analysisData.topStudents[items[0].dataIndex];
              return `${student?.name || "Student"} (${student?.branch})`;
            },
            label: (ctx) => ` Score: ${ctx.parsed.y} / 100 (Top in Branch)`,
          },
        },
      },
      scales: {
        y: {
          title: { display: true, text: "Marks", font: { weight: "600", size: 12 } },
          min: 0,
          max: 100,
          grid: { color: "rgba(229, 231, 235, 0.6)" },
        },
        x: {
          grid: { display: false },
          ticks: {
            maxRotation: 45,
            minRotation: 20,
            font: { size: 11 },
          },
        },
      },
    }),
    [analysisData]
  );

  // 6. Fees Analysis by Branch (Grouped Bar Chart)
  const feesData = useMemo(() => {
    if (!analysisData?.feesStatus?.length) return null;
    return {
      labels: analysisData.feesStatus.map((f) => f.branch),
      datasets: [
        {
          label: "Paid",
          data: analysisData.feesStatus.map((f) => f.paid),
          backgroundColor: "rgba(16, 185, 129, 0.8)",
          borderColor: "#10B981",
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "Unpaid",
          data: analysisData.feesStatus.map((f) => f.unpaid),
          backgroundColor: "rgba(239, 68, 68, 0.8)",
          borderColor: "#EF4444",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [analysisData]);

  const groupedBarOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          align: "end",
          labels: {
            boxWidth: 12,
            padding: 10,
            font: { size: 11 },
          },
        },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.95)",
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: {
        y: {
          title: { display: true, text: "Students", font: { weight: "600", size: 12 } },
          beginAtZero: true,
          grid: { color: "rgba(229, 231, 235, 0.6)" },
        },
        x: {
          grid: { display: false },
          ticks: {
            maxRotation: 45,
            minRotation: 20,
            font: { size: 11 },
          },
        },
      },
    }),
    []
  );

  // 7. Branchwise Placement Analysis (Grouped Bar Chart)
  const branchPlacementData = useMemo(() => {
    if (!analysisData?.branchPlacement?.length) return null;
    return {
      labels: analysisData.branchPlacement.map((b) => b.branch),
      datasets: [
        {
          label: "Placed",
          data: analysisData.branchPlacement.map((b) => b.placed),
          backgroundColor: "rgba(99, 102, 241, 0.85)",
          borderColor: "#6366F1",
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "Unplaced",
          data: analysisData.branchPlacement.map((b) => b.unplaced),
          backgroundColor: "rgba(236, 72, 153, 0.85)",
          borderColor: "#EC4899",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [analysisData]);

  // 8. Placement Status (Doughnut Chart)
  const placementData = useMemo(() => {
    if (!analysisData?.placementStatus) return null;
    const { placed, unplaced } = analysisData.placementStatus;
    return {
      labels: ["Placed", "Unplaced"],
      datasets: [
        {
          data: [placed, unplaced],
          backgroundColor: ["rgba(16, 185, 129, 0.85)", "rgba(249, 115, 22, 0.85)"],
          borderColor: ["#10B981", "#F97316"],
          borderWidth: 1.5,
          hoverOffset: 8,
        },
      ],
    };
  }, [analysisData]);

  const placementOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 12,
            padding: 10,
            font: { size: 12 },
          },
        },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.95)",
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              const total = analysisData.placementStatus.total || 1;
              const val = ctx.parsed;
              const pct = ((val / total) * 100).toFixed(1);
              return ` ${ctx.label}: ${val} Students (${pct}%)`;
            },
          },
        },
      },
    }),
    [analysisData]
  );

  return (
    <div className="dashboard w-full space-y-6">
      {/* Header Bar with Refresh Action & Summary Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Student Performance & Placement Analytics
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time interactive visualizations rendered client-side with Chart.js
          </p>
        </div>

        <button
          onClick={fetchCharts}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200 text-sm font-semibold rounded-xl transition-all disabled:opacity-60 cursor-pointer w-fit"
          title="Refresh Analytics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Updating..." : "Refresh Data"}</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      {analysisData?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3.5">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Analyzed Students</p>
              <p className="text-xl font-bold text-gray-800">
                {analysisData.summary.totalStudents.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3.5">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Average Marks</p>
              <p className="text-xl font-bold text-gray-800">
                {analysisData.summary.overallAverageMarks} / 100
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3.5">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Average Attendance</p>
              <p className="text-xl font-bold text-gray-800">
                {analysisData.summary.overallAverageAttendance}%
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3.5">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Placement Rate</p>
              <p className="text-xl font-bold text-gray-800">
                {analysisData.summary.placementRate}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={fetchCharts}
            className="text-xs font-semibold underline hover:text-red-800 flex-shrink-0"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Chart 1: Marks and Attendance Relation */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Marks and Attendance Relation
              </h3>
              <p className="text-xs text-gray-400">
                Individual student distribution grouped by engineering branch
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 font-medium rounded-full">
              Scatter
            </span>
          </div>

          <div className="relative h-72 sm:h-80 w-full flex items-center justify-center">
            {loading && !scatterData ? (
              <div className="flex flex-col items-center gap-2">
                <Loader className="animate-spin text-blue-500 h-8 w-8" />
                <span className="text-xs text-gray-400">Loading relation data...</span>
              </div>
            ) : scatterData ? (
              <Scatter data={scatterData} options={scatterOptions} />
            ) : (
              <p className="text-sm text-gray-400">No relation data available</p>
            )}
          </div>
        </div>

        {/* Chart 2: Branchwise Student Distribution */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Branchwise Student Distribution
              </h3>
              <p className="text-xs text-gray-400">
                Proportional breakdown of enrolled students per branch
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-purple-50 text-purple-600 font-medium rounded-full">
              Doughnut
            </span>
          </div>

          <div className="relative h-72 sm:h-80 w-full flex items-center justify-center">
            {loading && !pieData ? (
              <div className="flex flex-col items-center gap-2">
                <Loader className="animate-spin text-purple-500 h-8 w-8" />
                <span className="text-xs text-gray-400">Loading distribution...</span>
              </div>
            ) : pieData ? (
              <Doughnut data={pieData} options={pieOptions} />
            ) : (
              <p className="text-sm text-gray-400">No branch distribution available</p>
            )}
          </div>
        </div>

        {/* Chart 3: Attendance Overview */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Attendance Overview
              </h3>
              <p className="text-xs text-gray-400">
                Branch-wise average attendance scores (Green = highest, Red = lowest)
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-600 font-medium rounded-full">
              Horizontal Bar
            </span>
          </div>

          <div className="relative h-72 sm:h-80 w-full flex items-center justify-center">
            {loading && !attendanceData ? (
              <div className="flex flex-col items-center gap-2">
                <Loader className="animate-spin text-emerald-500 h-8 w-8" />
                <span className="text-xs text-gray-400">Loading attendance...</span>
              </div>
            ) : attendanceData ? (
              <Bar data={attendanceData} options={attendanceOptions} />
            ) : (
              <p className="text-sm text-gray-400">No attendance data available</p>
            )}
          </div>
        </div>

        {/* Chart 4: Marks Overview */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Marks Overview
              </h3>
              <p className="text-xs text-gray-400">
                Branch-wise mean exam performance (Green = highest, Red = lowest)
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-violet-50 text-violet-600 font-medium rounded-full">
              Horizontal Bar
            </span>
          </div>

          <div className="relative h-72 sm:h-80 w-full flex items-center justify-center">
            {loading && !marksData ? (
              <div className="flex flex-col items-center gap-2">
                <Loader className="animate-spin text-violet-500 h-8 w-8" />
                <span className="text-xs text-gray-400">Loading marks overview...</span>
              </div>
            ) : marksData ? (
              <Bar data={marksData} options={marksOptions} />
            ) : (
              <p className="text-sm text-gray-400">No marks overview available</p>
            )}
          </div>
        </div>

        {/* Chart 5: Top Students */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Top Students by Branch
              </h3>
              <p className="text-xs text-gray-400">
                Highest individual student score per engineering discipline
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-600 font-medium rounded-full">
              Rankings
            </span>
          </div>

          <div className="relative h-72 sm:h-80 w-full flex items-center justify-center">
            {loading && !topStudentsData ? (
              <div className="flex flex-col items-center gap-2">
                <Loader className="animate-spin text-amber-500 h-8 w-8" />
                <span className="text-xs text-gray-400">Loading top students...</span>
              </div>
            ) : topStudentsData ? (
              <Bar data={topStudentsData} options={topStudentsOptions} />
            ) : (
              <p className="text-sm text-gray-400">No top students data available</p>
            )}
          </div>
        </div>

        {/* Chart 6: Fees Analysis */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Fees Analysis
              </h3>
              <p className="text-xs text-gray-400">
                Paid vs Unpaid student counts categorized by branch
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-rose-50 text-rose-600 font-medium rounded-full">
              Grouped Bar
            </span>
          </div>

          <div className="relative h-72 sm:h-80 w-full flex items-center justify-center">
            {loading && !feesData ? (
              <div className="flex flex-col items-center gap-2">
                <Loader className="animate-spin text-rose-500 h-8 w-8" />
                <span className="text-xs text-gray-400">Loading fee status...</span>
              </div>
            ) : feesData ? (
              <Bar data={feesData} options={groupedBarOptions} />
            ) : (
              <p className="text-sm text-gray-400">No fee analysis data available</p>
            )}
          </div>
        </div>

        {/* Chart 7: Branchwise Placement Analysis */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Branchwise Placement Analysis
              </h3>
              <p className="text-xs text-gray-400">
                Placed vs Unplaced distribution across disciplines (Criteria: Marks &gt;= 60 & Attendance &gt;= 60)
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-600 font-medium rounded-full">
              Branch Placement
            </span>
          </div>

          <div className="relative h-72 sm:h-80 w-full flex items-center justify-center">
            {loading && !branchPlacementData ? (
              <div className="flex flex-col items-center gap-2">
                <Loader className="animate-spin text-indigo-500 h-8 w-8" />
                <span className="text-xs text-gray-400">Loading placement data...</span>
              </div>
            ) : branchPlacementData ? (
              <Bar data={branchPlacementData} options={groupedBarOptions} />
            ) : (
              <p className="text-sm text-gray-400">No branch placement data available</p>
            )}
          </div>
        </div>

        {/* Chart 8: Overall Placement Analysis */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Overall Placement Analysis
              </h3>
              <p className="text-xs text-gray-400">
                Total proportion of Placed vs Unplaced candidates across all departments
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-600 font-medium rounded-full">
              Placement Ratio
            </span>
          </div>

          <div className="relative h-72 sm:h-80 w-full flex items-center justify-center">
            {loading && !placementData ? (
              <div className="flex flex-col items-center gap-2">
                <Loader className="animate-spin text-emerald-500 h-8 w-8" />
                <span className="text-xs text-gray-400">Loading ratio...</span>
              </div>
            ) : placementData ? (
              <Doughnut data={placementData} options={placementOptions} />
            ) : (
              <p className="text-sm text-gray-400">No placement ratio available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
