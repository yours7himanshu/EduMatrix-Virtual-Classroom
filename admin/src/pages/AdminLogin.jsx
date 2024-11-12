import { useState  } from "react";
import { Link } from "react-router-dom";

function AdminLogin() {
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');

    const handleSubmit = (e)=>{
        e.preventDefault();
    }

  return (
    <div className="min-h-screen max-w-screen flex " >

        <div className="first w-[50%] h-screen flex justify-start items-center  bg-blue-600 p-4"  >
        <img className="h-[50%]" src="https://png.pngtree.com/png-vector/20240616/ourmid/pngtree-man-using-laptop-png-image_12780624.png" alt="" />

       <div className="discription flex flex-col gap-5 ">
       <h1 className="text-white font-bold text-3xl" >Wanted to make Eductaion Awesome??</h1>
       <p className="text-yellow-300 font-semibold" >Lorem ipsum dolor sit amet consectetur, adipisicing elit. Praesentium, voluptate.</p>
       </div>
        </div>

        <div className="second flex justify-center items-center w-[50%] h-screen ">
        <form className=" flex flex-col gap-3 p-10 h-auto border border-gray-200 shadow-2xl  items-center rounded-lg " onSubmit={handleSubmit}>
        <h1 className="text-3xl font-medium text-zinc-600 mb-10" >Admin Login</h1>
        

        <input className="border w-full border-gray-300 h-10 rounded-sm p-2"
         type="email"
         placeholder="Email" 
         value={email}
         onChange={(e)=>{setEmail(e.target.value)}}
         required
         />

         <input 
         className=" border border-gray-300 w-full h-10 rounded-sm p-2"
         type="password"
         placeholder="Password"
         value={password}
         onChange={(e)=>{setPassword(e.target.value)}}
         required
          />
       
        <button className="bg-violet-600 mt-7 text-white font-semibold w-full border-none outline-none rounded-md  p-2" type="submit" >Login</button>
      
         
        <p>Do not have and account?? <Link to="/sign-up" className="cursor-pointer text-blue-600 font-semibold" >Sign Up</Link> </p>
      </form>
        </div>
      
      
    </div>
  )
}

export default AdminLogin
