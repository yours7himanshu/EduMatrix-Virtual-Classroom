import { useState } from "react"

function AddTeacher() {
    const [teacherName,setTeacherName]=useState('');
    const [teacherQualification,setTeacherQualification]=useState('');
    const [teacherSubject,setTeacherSubject]=useState('');
    const [teacherExperience,setTeacherExpericence]=useState('');


    const handleSubmit = (e)=>{
        e.preventDefault();
    }
  return (
    <div className="teachers-section flex flex-col items-center justify-center gap-5 h-screen w-[80%]" >
      <h1 className="text-zinc-800 font-semibold text-3xl" >Add Teachers of your College to help Students!!</h1>
      <form className="flex flex-col gap-2 w-[50%] border border-gray-300 shadow-lg p-10 rounded-lg" onSubmit={handleSubmit}>

        <input type="text"
        placeholder="Faculty Name"
        value={teacherName}
        className="border border-gray-300 h-10 w-full p-2 rounded-md"
        onChange={(e)=>setTeacherName(e.target.value)}
        required
         />

         <input type="text"
         placeholder="Faculty Qualification" 
         value={teacherQualification}
         className="border border-gray-300 h-10 w-full p-2 rounded-md"
         onChange={(e)=>setTeacherQualification(e.target.value)}
         required
         />

         <input type="text" 
         placeholder="Faculty Subject"
         value={teacherSubject}
         className="border border-gray-300 h-10 w-full p-2 rounded-md"
         onChange={(e)=>setTeacherSubject(e.target.value)}
         required/>

         <input type="number"
         placeholder="Years of Experience of Faculty in the field" 
         value={teacherExperience}
         className="border border-gray-300 h-10 w-full p-2 rounded-md"
         onChange={(e)=>setTeacherExpericence(e.target.value)}
         required
         />

     <button type="submit" className="w-full h-10 mt-10 rounded-md bg-violet-600 text-white font-medium" >Add Teacher</button>
      </form>
    </div>
  )
}

export default AddTeacher
