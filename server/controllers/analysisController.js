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

const registrarFeesModel = require("../models/registrarFees");
const StudentMarksAttendance = require("../models/student_marks_attendance");

const testFunction = async (req, res) => {
  try {
    const [registrarList, marksList] = await Promise.all([
      registrarFeesModel.find().lean(),
      StudentMarksAttendance.find().lean(),
    ]);

    // Handle empty data gracefully
    if (!registrarList.length && !marksList.length) {
      const emptyPayload = {
        summary: {
          totalStudents: 0,
          overallAverageMarks: 0,
          overallAverageAttendance: 0,
          placementRate: 0,
          totalPlaced: 0,
          totalUnplaced: 0,
          totalBranches: 0,
        },
        branches: [],
        attendanceOverview: [],
        marksOverview: [],
        scatter: [],
        topStudents: [],
        branchDistribution: [],
        feesStatus: [],
        placementStatus: { placed: 0, unplaced: 0, total: 0, rate: 0 },
        branchPlacement: [],
      };

      return res.json({
        success: true,
        message: "No student records found",
        data: emptyPayload,
        analysis: emptyPayload,
      });
    }

    // Map registrar by RollNumber
    const regMap = new Map();
    registrarList.forEach((r) => {
      if (r.RollNumber != null) {
        regMap.set(String(r.RollNumber).trim(), r);
      }
    });

    // Merge on RollNumber
    const merged = [];
    marksList.forEach((m) => {
      if (m.RollNumber != null) {
        const rollKey = String(m.RollNumber).trim();
        const reg = regMap.get(rollKey);
        if (reg) {
          const marks = Math.max(0, Math.min(100, Number(m.Marks) || 0));
          const attendance = Math.max(0, Math.min(100, Number(m.Attendance) || 0));
          const placed = marks >= 60 && attendance >= 60 ? "Placed" : "Unplaced";
          const rawStatus = (reg.Fees_status || "").trim().toLowerCase();
          const feesStatus = rawStatus === "paid" ? "Paid" : "Unpaid";
          const branch = (reg.Branch || "General").trim();

          merged.push({
            rollNumber: m.RollNumber,
            name: m.Name || reg.Name || `Student ${m.RollNumber}`,
            branch,
            marks,
            attendance,
            fees: Number(reg.Fees) || 0,
            feesStatus,
            placed,
            section: m.Section || "",
            year: m.Year || "",
          });
        }
      }
    });

    if (merged.length === 0) {
      const emptyPayload = {
        summary: {
          totalStudents: 0,
          overallAverageMarks: 0,
          overallAverageAttendance: 0,
          placementRate: 0,
          totalPlaced: 0,
          totalUnplaced: 0,
          totalBranches: 0,
        },
        branches: [],
        attendanceOverview: [],
        marksOverview: [],
        scatter: [],
        topStudents: [],
        branchDistribution: [],
        feesStatus: [],
        placementStatus: { placed: 0, unplaced: 0, total: 0, rate: 0 },
        branchPlacement: [],
      };

      return res.json({
        success: true,
        message: "No matched student records found",
        data: emptyPayload,
        analysis: emptyPayload,
      });
    }

    // Aggregate by Branch
    const branchMap = {};
    let totalMarksSum = 0;
    let totalAttendanceSum = 0;
    let totalPlaced = 0;

    merged.forEach((s) => {
      totalMarksSum += s.marks;
      totalAttendanceSum += s.attendance;
      if (s.placed === "Placed") totalPlaced += 1;

      if (!branchMap[s.branch]) {
        branchMap[s.branch] = {
          branch: s.branch,
          totalAttendance: 0,
          totalMarks: 0,
          count: 0,
          topStudent: null,
          feesStatus: { Paid: 0, Unpaid: 0 },
          placed: 0,
          unplaced: 0,
        };
      }

      const b = branchMap[s.branch];
      b.totalAttendance += s.attendance;
      b.totalMarks += s.marks;
      b.count += 1;

      if (!b.topStudent || s.marks > b.topStudent.marks) {
        b.topStudent = {
          name: s.name,
          marks: s.marks,
          branch: s.branch,
        };
      }

      if (s.feesStatus === "Paid") {
        b.feesStatus.Paid += 1;
      } else {
        b.feesStatus.Unpaid += 1;
      }

      if (s.placed === "Placed") {
        b.placed += 1;
      } else {
        b.unplaced += 1;
      }
    });

    const branches = Object.keys(branchMap).sort();
    const totalStudents = merged.length;
    const totalUnplaced = totalStudents - totalPlaced;
    const overallAverageMarks = Number((totalMarksSum / totalStudents).toFixed(1));
    const overallAverageAttendance = Number((totalAttendanceSum / totalStudents).toFixed(1));
    const placementRate = Number(((totalPlaced / totalStudents) * 100).toFixed(1));

    const attendanceOverview = branches.map((b) => ({
      branch: b,
      meanAttendance: Number((branchMap[b].totalAttendance / branchMap[b].count).toFixed(2)),
    }));

    const marksOverview = branches.map((b) => ({
      branch: b,
      meanMarks: Number((branchMap[b].totalMarks / branchMap[b].count).toFixed(2)),
    }));

    const topStudents = branches.map((b) => branchMap[b].topStudent);

    const branchDistribution = branches.map((b) => ({
      branch: b,
      count: branchMap[b].count,
      percentage: Number(((branchMap[b].count / totalStudents) * 100).toFixed(1)),
    }));

    const feesStatus = branches.map((b) => ({
      branch: b,
      paid: branchMap[b].feesStatus.Paid,
      unpaid: branchMap[b].feesStatus.Unpaid,
    }));

    const branchPlacement = branches.map((b) => ({
      branch: b,
      placed: branchMap[b].placed,
      unplaced: branchMap[b].unplaced,
      total: branchMap[b].count,
    }));

    const scatter = merged.map((s) => ({
      x: s.attendance,
      y: s.marks,
      branch: s.branch,
      name: s.name,
      rollNumber: s.rollNumber,
    }));

    const resultData = {
      summary: {
        totalStudents,
        overallAverageMarks,
        overallAverageAttendance,
        placementRate,
        totalPlaced,
        totalUnplaced,
        totalBranches: branches.length,
      },
      branches,
      attendanceOverview,
      marksOverview,
      scatter,
      topStudents,
      branchDistribution,
      feesStatus,
      placementStatus: {
        placed: totalPlaced,
        unplaced: totalUnplaced,
        total: totalStudents,
        rate: placementRate,
      },
      branchPlacement,
    };

    return res.json({
      success: true,
      message: "Analysis data computed successfully",
      data: resultData,
      analysis: resultData,
    });
  } catch (error) {
    console.error("Error generating analysis data:", error);
    return res.status(500).json({
      success: false,
      message: "Error computing student analysis data",
      error: error.message,
    });
  }
};

module.exports = testFunction;