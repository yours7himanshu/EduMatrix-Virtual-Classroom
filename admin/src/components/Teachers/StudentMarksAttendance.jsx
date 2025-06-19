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
    <div className="min-h-screen  bg-gray-100 w-full flex flex-col items-center justify-center py-12 md:py-16 px-4"> {/* Changed w-screen, py, added px-4 and flex for centering */}
      <div className="max-w-3xl w-full max-md:mt-10 mx-auto bg-white shadow-lg rounded-lg p-6 md:p-8"> {/* Removed ml-[34%], added w-full, adjusted padding */}
        <h2 className="text-2xl max-md:text-xl font-semibold text-gray-800 mb-6 text-center md:text-left">Student Marks & Attendance</h2> {/* Centered text on mobile */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"> {/* Adjusted gap */}
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" /> Student Name
              </label>
              <input
                type="text"
                placeholder="Enter Student Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border outline-none border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1 flex items-center">
                <Hash className="w-5 h-5 mr-2 text-blue-500" /> Roll Number
              </label>
              <input
                type="number"
                placeholder="Enter Student Roll Number"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="border outline-none border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1 flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-blue-500" /> Marks
              </label>
              <input
                type="number"
                placeholder="Enter Student Marks"
                value={marks}
                onChange={(e) => setStudentMarks(e.target.value)}
                className="border outline-none border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1 flex items-center">
                <CheckSquare className="w-5 h-5 mr-2 text-blue-500" /> Attendance (%)
              </label>
              <input
                type="number"
                placeholder="Enter Student Attendance"
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
                className="border outline-none border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" /> Year
              </label>
              <input
                type="number"
                placeholder="Enter Student Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="border outline-none border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1 flex items-center">
                <Layers className="w-5 h-5 mr-2 text-blue-500" /> Section
              </label>
              <input
                type="text"
                placeholder="Enter Student Section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="border outline-none border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};
export default AppLayout()(StudentMarksAttendance);