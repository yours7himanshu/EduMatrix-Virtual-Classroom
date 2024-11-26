import { useState } from "react";
import Sidebar from "./Sidebar";
import { toast } from "react-toastify";
import axios from "axios";
// import student from "../assets/student.jpg";

function Students() {
  const [studentName, setStudentName] = useState("");
  const [studentBranch, setStudentBranch] = useState("");
  const [studentYear, setStudentYear] = useState("");
  const [studentRollNo, setStudentRollNo] = useState("");
  const [image, setImage] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${backendUrl}/api/v1/`, {
        studentName,
        studentBranch,
        studentYear,
        studentRollNo,
      });
      if (response.data.success) {
        toast.success("Student Successfully Enrolled");
      }
    } catch (error) {
      console.log("Some error occurred", error);
      toast.error("Error Enrolling Student");
    }
  };

  return (
    <div className="flex min-h-screen ml-[20%] bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl text-center w-full font-semibold text-violet-700">
            Enroll Students for Your College
          </h1>
          {/* <img
            src={student}
            alt="Student"
            className="w-[10%] h-32 object-cover rounded-lg shadow-lg"
          /> */}
        </div>

        <form
          className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200"
              required
            />

            <input
              type="number"
              placeholder="Student Roll No"
              value={studentRollNo}
              onChange={(e) => setStudentRollNo(e.target.value)}
              className="p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200"
              required
            />
          </div>

          <input
            type="file"
            className="mt-4 p-2 w-full border border-gray-300 rounded-md file:bg-violet-50 file:text-violet-700 file:font-semibold file:rounded-md hover:file:bg-violet-100 transition duration-200"
            value={image}
            onChange={(e) => setImage(e.target.files)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <input
              type="text"
              placeholder="Student Branch"
              value={studentBranch}
              onChange={(e) => setStudentBranch(e.target.value)}
              className="p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200"
              required
            />

            <input
              type="number"
              placeholder="Enter Student Year"
              value={studentYear}
              onChange={(e) => setStudentYear(e.target.value)}
              className="p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-6 bg-violet-600 text-white font-semibold text-lg rounded-md hover:bg-violet-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          >
            Enroll Student
          </button>
        </form>
      </div>
    </div>
  );
}

export default Students;
