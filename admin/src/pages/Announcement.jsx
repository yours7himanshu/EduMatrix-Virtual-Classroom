
import { useState } from "react";
const Announcement = ()=>{


    const [category,setCategory]=useState('');
    const [description,setDescription]=useState('');
    const [course,setCourse]=useState('');
    

    const handleSubmit = (e)=>{
        e.preventDefault();
    }
    return (
        <>
        <div className="announcement flex flex-col items-center w-full mt-20  ">
            <h1 className="font-bold text-3xl"  >Post Announcement for your college!!</h1>
           <form className="flex w-[40%] flex-col gap-4 mt-20 rounded-md border border-gray-300 shadow-lg p-10" onSubmit={handleSubmit} >

          <input type="text"
          placeholder="Category"
          className="border border-gray-300 p-3 w-full h-10"
          value={category}
          onChange={(e)=>setCategory(e.target.value)}
          required
          
          />
   <select placeholder="Courses" name="Course" id="">
   <option value="volvo">B.tech</option>
  <option value="saab">MBA</option>
  <option value="opel">B.Sc</option>
  <option value="audi">B.Pharma</option>
   </select>



           </form>
        </div>
        
        </>
    )
}

export default Announcement;