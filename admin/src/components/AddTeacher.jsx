import { useState } from "react";
import Sidebar from "./Sidebar";
import axios from "axios";
import { toast } from "react-toastify";
import TeacherRole from "./TeacherRole";

function AddTeacher() {
  const [name, setName] = useState("");
  const [qualification, setQualification] = useState("");
  const [subject, setSubject] = useState("");
  const [experience, setExperience] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${backendUrl}/api/v4/add-teacher`, {
        name,
        qualification,
        subject,
        experience,
      });

      if (response.data.success) {
        toast.success("Teachers successfully added in our website");
      }
    } catch (error) {
      console.log("Error occured on adding the teachers", error);
      toast.error("Some error occured on adding the teachers");
    }
  };
  return (
   <div className="addTeacher ml-[30%] flex">
    <Sidebar/>
     <div className="addteachers w-[80%] flex-col items-center justify-center ">
      <TeacherRole />
      <div className="teachers-section flex flex-col items-center justify-center gap-5 h-screen w-[100%]">
       
        <form
          className="flex flex-col gap-2 w-[60%] border border-gray-100 shadow-lg p-10 rounded-lg"
          onSubmit={handleSubmit}
        >
           <h1 className="text-violet-800 font-semibold mb-3 text-3xl">
          Add Teachers of your College to help Students!!
        </h1>

          <input
            type="text"
            placeholder="Faculty Name"
            value={name}
            className="border border-gray-300 h-10 w-full p-2 rounded-md"
            onChange={(e) => setName(e.target.value)}
            required
          />

         <select name="qualifications"
         className="border border-gray-300 h-10 w-full p-2 rounded-md focus:text-black text-gray-400"
         id="qualifications">
          <option value="choose">Choose your Qualification</option>
          <option value="choose">B.Tech</option>
          <option value="choose">M.Sc</option>
          <option value="choose">P.hd</option>
          <option value="choose">B.Sc</option>

         </select>

          <input
            type="text"
            placeholder="Faculty Subject"
            value={subject}
            className="border border-gray-300 h-10 w-full p-2 rounded-md"
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Years of Experience of Faculty in the field"
            value={experience}
            className="border border-gray-300 h-10 w-full p-2 rounded-md"
            onChange={(e) => setExperience(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full h-10 mt-10 rounded-md bg-violet-600 text-white font-medium"
          >
            Add Teacher
          </button>
        </form>
      </div>
    </div>
   </div>
  );
}

export default AddTeacher;
