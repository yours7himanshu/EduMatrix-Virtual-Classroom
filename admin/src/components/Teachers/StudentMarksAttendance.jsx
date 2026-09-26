import { useState } from "react";
import {toast} from 'react-toastify';
import axios from 'axios'
import { User, Hash, BarChart2, CheckSquare, Calendar, Layers } from 'lucide-react';
import AppLayout from "../../layout/AppLayout";
// Define backend URL
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const StudentMarksAttendance = () => {
  const [rollNo, setRollNo] = useState("");
  const [name, setName] = useState("");
  const [marks, setStudentMarks] = useState("");
  const [attendance, setAttendance] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");

  const handleSubmit = async(e) => {
    e.preventDefault();
   try {
     const response = await axios.post(`${backendUrl}/api/v6/add-student-marks-attendance`,{
      RollNumber:rollNo,
      Name:name,
      Marks:marks,
      Attendance:attendance,
      Year:year,
      Section:section
     })

     if(response.data.success){
        toast.success(response.data.message);
        setRollNo("");
        setName("");
        setStudentMarks("");
        setAttendance("");
        setYear("");
        setSection("");
     }
   }catch(error){
    if(error.response?.data?.message){
      toast.error(error.response.data.message);
    }else{
      toast.error("Something went wrong");
    }
   }
    
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full flex flex-col items-center justify-center py-6 sm:py-12 px-3 sm:px-6">
      <div className="max-w-3xl w-full mx-auto bg-white shadow-sm border border-gray-200/80 rounded-2xl p-5 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center sm:text-left">Student Marks & Attendance</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                <User className="w-4 h-4 mr-2 text-blue-500" /> Student Name
              </label>
              <input
                type="text"
                placeholder="Enter Student Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full border border-gray-300 rounded-xl px-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                <Hash className="w-4 h-4 mr-2 text-blue-500" /> Roll Number
              </label>
              <input
                type="number"
                placeholder="Enter Student Roll Number"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="h-11 w-full border border-gray-300 rounded-xl px-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                <BarChart2 className="w-4 h-4 mr-2 text-blue-500" /> Marks
              </label>
              <input
                type="number"
                placeholder="Enter Student Marks"
                value={marks}
                onChange={(e) => setStudentMarks(e.target.value)}
                className="h-11 w-full border border-gray-300 rounded-xl px-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                <CheckSquare className="w-4 h-4 mr-2 text-blue-500" /> Attendance (%)
              </label>
              <input
                type="number"
                placeholder="Enter Student Attendance"
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
                className="h-11 w-full border border-gray-300 rounded-xl px-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" /> Year
              </label>
              <input
                type="number"
                placeholder="Enter Student Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-11 w-full border border-gray-300 rounded-xl px-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                <Layers className="w-4 h-4 mr-2 text-blue-500" /> Section
              </label>
              <input
                type="text"
                placeholder="Enter Student Section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="h-11 w-full border border-gray-300 rounded-xl px-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full h-11 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/30 transition shadow-sm"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};
export default AppLayout()(StudentMarksAttendance);