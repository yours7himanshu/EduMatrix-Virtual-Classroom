import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
function SignUp() {
  const [state, setState] = useState("Signup");
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const onSubmitHandler = (e) => {
    e.preventDefault();
    const data = {
      fullname,
      username,
      email,
      password,
    };
    setEmail("");
    setFullName("");
    setUsername("");
    setPassword("");
    console.log(data);
    signup(data);
  };
  const signup = async (data) => {
    const url = "https://localhost:3001/api/v1/register";
    const response = await axios.post(url, data);
    if (response) {
      console.log(response.data);
    }
  };
  return (
    <form
      onSubmit={(e) => onSubmitHandler(e)}
      className="min-h-[80vh] flex justify-center items-center "
    >
      <div className=" flex-col items-center  gap-5  py-[2%] px-[4%] shadow-lg shadow-zinc-700">
        <p className="text-xl font-bold">
          {state == "Signup" ? "Create Account" : "Login Account"}
        </p>
        <div>
          <p>Full Name</p>
          <input
            type="text"
            onChange={(e) => setFullName(e.target.value)}
            className="w-[95%] my-1 h-[50%] border-2 border-zinc-200 rounded-sm"
            value={fullname}
          />
        </div>
        <div>
          <p>Username</p>
          <input
            type="text"
            onChange={(e) => setUsername(e.target.value)}
            className="w-[95%] my-1 h-[50%] border-2 border-zinc-200 rounded-sm"
            value={username}
          />
        </div>
        <div>
          <p>Email</p>
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-[95%] my-1 h-[50%] border-2 border-zinc-200 rounded-sm"
            value={email}
          />
        </div>
        <div>
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            value={password}
            className="w-[95%] my-1 h-[50%] border-2 border-zinc-200 rounded-sm"
          />
        </div>
        <button
          type="Submit"
          className="px-4 py-2 text-md bg-slate-600 text-white rounded-md my-4 mx-auto"
        >
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
