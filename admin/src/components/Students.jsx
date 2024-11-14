import { useState } from "react";
import Sidebar from "./Sidebar";
import { toast } from "react-toastify";

function Students() {
  const [studentName, setStudentName] = useState('');
  const [studentBranch, setStudentBranch] = useState('');
  const [studentYear, setStudentYear] = useState('');
  const [studentRollNo, setStudentRollNo] = useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async(e) => {
    e.preventDefault();
   try{
    const response = await axios.post(`${backendUrl}/api/v1/`,{
      studentName,
      studentBranch,
      studentYear,
      studentRollNo

    });
   if(response.data.success){
    toast.success("Student Successfully Enrolled");
   }
  
   }
   catch(error){
    console.log("Some error occured",error);
    toast.error("Error Enrolling Student");
   }
  };

  return (
   <div className="students flex">
    <Sidebar/>
     <div className="enroll-students flex flex-col items-center w-full h-screen bg-gray-50 p-8">
      <h1 className="text-3xl text-violet-600 font-bold mb-10">
        Enroll Students for Your College
      </h1>
      
      <form
        className="flex border border-gray-300 flex-col gap-6 w-full max-w-lg bg-white p-8 rounded-lg shadow-lg"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Student Name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-violet-500 transition duration-200"
          required
        />
        
        <input
          type="number"
          placeholder="Student Roll No"
          value={studentRollNo}
          onChange={(e) => setStudentRollNo(e.target.value)}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-violet-500 transition duration-200"
          required
        />
        
        <input
          type="file"
          className="p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          accept="image/*"
        />

        <input
          type="text"
          placeholder="Student Branch"
          value={studentBranch}
          onChange={(e) => setStudentBranch(e.target.value)}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-violet-500 transition duration-200"
          required
        />

        <input
          type="number"
          placeholder="Enter Student Year"
          value={studentYear}
          onChange={(e) => setStudentYear(e.target.value)}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-violet-500 transition duration-200"
          required
        />

        <button
          type="submit"
          className="w-full py-2 mt-4 bg-violet-600 text-white rounded-md font-semibold text-lg hover:bg-violet-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          Enroll Student
        </button>
      </form>
    </div>
   </div>
  );
}

export default Students;

