import { Link } from "react-router-dom";
import { useState } from "react";
import axios from 'axios';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function AdminSignUp() {
  const [collegeName, setCollegeName] = useState("");
  const [directorName, setDirectorName] = useState("");
  const [email, setEmail] = useState("");
  const [centerCode, setCenterCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/v2/admin-register`, {
        collegeName,
        directorName,
        email,
        centerCode,
        password,
      });
      if (response.data.success) {
        toast.success(response.data.message || "College successfully registered");
        navigate('/');
      }
    } catch (error) {
      console.log("Some error occurred", error);
      if (error.response) {
        toast.error(`Error: ${error.response.data.message || "Internal server error"}`);
      } else if (error.request) {
        toast.error("No response from server.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-w-screen flex">
      <div className="first w-[50%] h-screen flex justify-start items-center bg-blue-600 p-4">
        <img
          className="h-[50%]"
          src="https://png.pngtree.com/png-vector/20240616/ourmid/pngtree-man-using-laptop-png-image_12780624.png"
          alt=""
        />
        <div className="discription flex flex-col gap-5">
          <h1 className="text-white font-bold text-3xl">
            Wanted to make Education Awesome??
          </h1>
          <p className="text-yellow-300 font-semibold">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit.
            Praesentium, voluptate.
          </p>
        </div>
      </div>

      <div className="second flex justify-center items-center w-[50%] h-screen">
        <form
          className="flex flex-col w-[70%] gap-3 p-10 h-auto border border-gray-200 shadow-2xl items-center rounded-lg"
          onSubmit={handleSubmit}
        >
          <h1 className="text-3xl font-medium text-zinc-600 mb-6">
            Admin Register
          </h1>

          <input
            type="text"
            className="border border-gray-300 h-10 w-full p-2 rounded-sm"
            placeholder="College Name"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            required
          />
          <input
            type="text"
            className="border border-gray-300 h-10 w-full p-2 rounded-sm"
            placeholder="Director Name"
            value={directorName}
            onChange={(e) => setDirectorName(e.target.value)}
            required
          />
          <input
            type="text"
            className="border border-gray-300 h-10 w-full p-2 rounded-sm"
            placeholder="Center Code"
            value={centerCode}
            onChange={(e) => setCenterCode(e.target.value)}
            required
          />
          <input
            className="border w-full border-gray-300 h-10 rounded-sm p-2"
            type="email"
            placeholder="College Administration Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
           
          />
          <input
            className="border w-full border-gray-300 h-10 rounded-sm p-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
           
          />

          <button
            className="bg-violet-600 mt-7 text-white font-semibold w-full border-none outline-none rounded-md p-2"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

          <p>
            Already have an account??{" "}
            <Link to="/" className="cursor-pointer text-blue-600 font-semibold">
              Login
            </Link>{" "}
          </p>
        </form>
      </div>
    </div>
  );
}

export default AdminSignUp;
