import { useState } from "react"
import Sidebar from "./Sidebar";
import axios from 'axios';
import {toast}from 'react-toastify';

function AddTeacher() {
    const [name,setName]=useState('');
    const [qualification,setQualification]=useState('');
    const [subject,setSubject]=useState('');
    const [experience,setExperience]=useState('');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;


    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
          const response = await axios.post(`${backendUrl}/api/v4/add-teacher`,{
            name,
            qualification,
            subject,
            experience
          })

          if(response.data.success){
            toast.success("Teachers successfully added in our website");
          }
        }
        catch(error){
          console.log("Error occured on adding the teachers",error);
          toast.error("Some error occured on adding the teachers");
        }
    }
  return (
    <div className="addteachers flex ">
      <Sidebar/>
 <div className="teachers-section flex flex-col items-center justify-center gap-5 h-screen w-[80%]" >
      <h1 className="text-zinc-800 font-semibold text-3xl" >Add Teachers of your College to help Students!!</h1>
      <form className="flex flex-col gap-2 w-[50%] border border-gray-300 shadow-lg p-10 rounded-lg" onSubmit={handleSubmit}>

        <input type="text"
        placeholder="Faculty Name"
        value={name}
        className="border border-gray-300 h-10 w-full p-2 rounded-md"
        onChange={(e)=>setName(e.target.value)}
        required
         />

         <input type="text"
         placeholder="Faculty Qualification" 
         value={qualification}
         className="border border-gray-300 h-10 w-full p-2 rounded-md"
         onChange={(e)=>setQualification(e.target.value)}
         required
         />

         <input type="text" 
         placeholder="Faculty Subject"
         value={subject}
         className="border border-gray-300 h-10 w-full p-2 rounded-md"
         onChange={(e)=>setSubject(e.target.value)}
         required/>

         <input type="number"
         placeholder="Years of Experience of Faculty in the field" 
         value={experience}
         className="border border-gray-300 h-10 w-full p-2 rounded-md"
         onChange={(e)=>setExperience(e.target.value)}
         required
         />

     <button type="submit" className="w-full h-10 mt-10 rounded-md bg-violet-600 text-white font-medium" >Add Teacher</button>
      </form>
    </div>
    </div>
   
  )
}

export default AddTeacher
