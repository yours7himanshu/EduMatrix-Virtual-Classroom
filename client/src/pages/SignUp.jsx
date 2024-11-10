import { useState } from "react";

function SignUp() {
  const [state, setState] = useState("Signup");
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return (
    <form className="min-h-[80vh] flex justify-center items-center">
      <div className="">
        <p>{state == "Signup" ? "Create Account" : "Login Account"}</p>
        <div>
          <p>Full Name</p>
          <input type="text" />
        </div>
        <div>
          <p>Username</p>
          <input type="text" />
        </div>
        <div>
          <p>Email</p>
          <input type="email" />
        </div>
        <div>
          <p>Password</p>
          <input type="password" />
        </div>
      </div>
    </form>
  );
}

export default SignUp;
