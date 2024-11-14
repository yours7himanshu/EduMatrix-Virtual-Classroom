import { useState  } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function AdminLogin() {
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [loading,setLoading]=useState(false);
    const backendUrl=import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    const handleSubmit = async(e)=>{
        e.preventDefault();
        setLoading(true);

        try{
          const response = await axios.post(`${backendUrl}/api/v1/admin-login`);

          if(response.data.success){
            const userToken = await response.data.token;
            localStorage.setItem("token",userToken);

            toast.success(response.data.success || "Login Successful");

            navigate('/dashboard');


          }
        }
        catch(error){
          console.log("Some error occured",error);
          toast.error("Internal Server Error");
        }
        finally{
          setLoading(false);
        }
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
       
        <button 
        type="submit"
        disabled={loading}
        className="bg-violet-600 mt-7 text-white font-semibold w-full border-none outline-none rounded-md  p-2" 
        
        >{loading?'Logging...':'Login'}</button>
      
         
        <p>Do not have and account?? <Link to="/sign-up" className="cursor-pointer text-blue-600 font-semibold" >Sign Up</Link> </p>
      </form>
        </div>
      
      
    </div>
  )
}

export default AdminLogin
