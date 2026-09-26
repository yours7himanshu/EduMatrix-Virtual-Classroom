import { useState } from "react";
import {toast} from 'react-toastify';
import axios from 'axios'
import { User, Hash, BarChart2, Calendar, Layers } from 'lucide-react';
import AppLayout from "../../layout/AppLayout";
// Define backend URL
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const RegistrarStudent = () => {
  const [rollNo, setRollNo] = useState("");
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [fees, setFees] = useState("");
  const [feesStatus, setFeesStatus] = useState("");
 

  const handleSubmit = async(e) => {
    e.preventDefault();
   try {
     const response = await axios.post(`${backendUrl}/api/v8/student-fees-data`,{
      RollNumber:rollNo,
      Name:name,
      Fees:fees,
      Branch:branch,
      Fees_status:feesStatus,
  
     })

     if(response.data.success){
       toast.success(response.data.message);
       setRollNo("");
       setName("")
       setFees("")
       setFeesStatus("")
       setBranch("")
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
      <div className="max-w-2xl w-full mx-auto bg-white shadow-xl rounded-2xl p-4 sm:p-8 border border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center sm:text-left tracking-tight">Student Fees Details</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="flex flex-col">
              <label className="text-gray-700 text-xs sm:text-sm font-semibold mb-1 flex items-center">
                <User className="w-4 h-4 mr-2 text-blue-500" /> Student Name
              </label>
              <input
                type="text"
                placeholder="Enter Student Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border outline-none border-gray-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 shadow-xs transition"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 text-xs sm:text-sm font-semibold mb-1 flex items-center">
                <Hash className="w-4 h-4 mr-2 text-blue-500" /> Roll Number
              </label>
              <input
                type="number"
                placeholder="Enter Student Roll Number"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="border outline-none border-gray-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 shadow-xs transition"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 text-xs sm:text-sm font-semibold mb-1 flex items-center">
                <BarChart2 className="w-4 h-4 mr-2 text-blue-500" /> Fees
              </label>
              <input
                type="number"
                placeholder="Enter Student Fees"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                className="border outline-none border-gray-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 shadow-xs transition"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 text-xs sm:text-sm font-semibold mb-1 flex items-center">
                <Layers className="w-4 h-4 mr-2 text-blue-500" /> Branch
              </label>
              <input
                type="text"
                placeholder="Enter Student Branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="border outline-none border-gray-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 shadow-xs transition"
                required
              />
            </div>
            <div className="flex flex-col sm:col-span-2">
              <label className="text-gray-700 text-xs sm:text-sm font-semibold mb-1 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" /> Fees Status
              </label>
              <select
                value={feesStatus}
                onChange={(e) => setFeesStatus(e.target.value)}
                className="border outline-none border-gray-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 shadow-xs transition bg-white"
                required
              >
                <option value="">Select Fees Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
           
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md hover:shadow-lg mt-2 cursor-pointer text-sm sm:text-base"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};
export default AppLayout()(RegistrarStudent);