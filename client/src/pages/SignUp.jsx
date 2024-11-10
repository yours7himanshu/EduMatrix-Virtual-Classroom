import { useState } from "react";

import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";


function SignUp() {
  const [state, setState] = useState("Signup");
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return (

    <form className="min-h-[80vh] flex justify-center items-center ">
      <div className=" flex-col items-center  gap-5  py-[2%] px-[4%] shadow-lg shadow-zinc-700">
        <p className="text-xl font-bold">
          {state == "Signup" ? "Create Account" : "Login Account"}
        </p>
        <div>
          <p>Full Name</p>
          <input
            type="text"
            className="w-[95%] my-1 h-[50%] border-2 border-zinc-200 rounded-sm"
          />
        </div>
        <div>
          <p>Username</p>
          <input
            type="text"
            className="w-[95%] my-1 h-[50%] border-2 border-zinc-200 rounded-sm"
          />
        </div>
        <div>
          <p>Email</p>
          <input
            type="email"
            className="w-[95%] my-1 h-[50%] border-2 border-zinc-200 rounded-sm"
          />
        </div>
        <div>
          <p>Password</p>
          <input
            type="password"
            className="w-[95%] my-1 h-[50%] border-2 border-zinc-200 rounded-sm"
          />
        </div>
        <button className="px-4 py-2 text-md bg-slate-600 text-white rounded-md my-4 mx-auto">
          Create Account
        </button>
        <p>
          Already have an account ? <Link to="/login">Login here</Link>
        </p>
      </div>
    </form>
 
  );
}

export default SignUp;
