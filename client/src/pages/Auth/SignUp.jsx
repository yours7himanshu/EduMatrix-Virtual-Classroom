
/*

Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

function SignUp() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${backendUrl}/api/v1/register`, {
        name,
        username,
        email,
        password,
      });
      if (response.data.success) {
        toast.success("Account Successfully created");
        navigate("/login");
      }
    } catch (error) {
      console.log("Some Error Occrured during login", error);
      toast.error("Internal Server Error");
    }
  };
  return (
    <div className="sign-up">
      <form
        onSubmit={handleSubmit}
        className="min-h-[90vh] flex justify-center items-center rounded-xl "
      >
        <div className=" flex-col items-center  gap-5  py-[2%] px-[4%] shadow-lg shadow-zinc-600">
          <p className="text-xl font-bold mb-2">Create Account</p>
          <div>
            <p>Full Name</p>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-[95%] p-2 my-1 h-[50%] border-2 border-zinc-200 rounded-sm"
            />
          </div>
          <div>
            <p>Username</p>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-[95%] p-2 my-1 h-[50%] border-2 border-zinc-200 rounded-sm"
            />
          </div>
          <div>
            <p>Email</p>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-[95%] p-2 my-1 h-[50%] border-2 border-zinc-200 rounded-sm"
            />
          </div>
          <div>
            <p>Password</p>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-[95%] p-2 my-1 h-[50%] border-2 border-zinc-200 rounded-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-md bg-slate-900 text-white rounded-md my-4 mx-auto hover:bg-slate-800"
          >
            Create Account
          </button>
          <p>
            Already have an account ?{" "}
            <Link className="text-blue-800 font-3xl" to="/login">
              Login here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default SignUp;
