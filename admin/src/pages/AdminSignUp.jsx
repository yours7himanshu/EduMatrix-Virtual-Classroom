import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ContextStore } from "../store/ContextStore";

function AdminSignUp() {
  const { collegeName, setCollegeName } = useContext(ContextStore);
  const [directorName, setDirectorName] = useState("");
  const [email, setEmail] = useState("");
  const [centerCode, setCenterCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');

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
        role,
        password,
      });
      if (response.data.success) {
        toast.success(response.data.message || "College successfully registered");
        navigate("/");
      }
    } catch (error) {
      console.log("Some error occurred", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Some unexpected error occurred...Try Again!!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      
      <div className="w-[50%] h-screen bg-gradient-to-r from-blue-600 to-violet-700 max-md:hidden   flex  justify-center items-start ">
        <img
          className="w-[50%] mt-[20%]"
          src="https://png.pngtree.com/png-vector/20240616/ourmid/pngtree-man-using-laptop-png-image_12780624.png"
          alt="Illustration"
        />
        <div className="text-white h-full mt-[30%] w-full">
          <h1 className="text-4xl font-bold mb-3">Wanted to make Education Awesome??</h1>
          <p className="text-yellow-300 text-lg font-semibold">
            Bridging the Gap Between Knowledge and Success. Learning Beyond Boundaries!
          </p>
        </div>
      </div>

      {/* Right Section: Form */}
      <div className="w-[50%] max-md:h-auto max-md:w-auto max-md:m-3 h-screen flex justify-center items-center bg-gray-50 p-6">
        <form
          className="w-full max-md:h-auto max-w-md p-8 bg-white rounded-lg shadow-xl border border-gray-200 max-md:p-10 "
          onSubmit={handleSubmit}
        >
          <h1 className="text-3xl max-md:text-xl max-md:mb-3 font-medium text-zinc-600 mb-6">Admin Register</h1>

          {/* Input Fields */}
          <input
            type="text"
            className="border max-md:mb-3 border-gray-300 max-md:h-15 max-md:text-sm max-md:p-2 h-12 w-full p-3 rounded-md mb-4"
            placeholder="College Name"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            required
          />
          <input
            type="text"
            className="border max-md:h-15 max-md:mb-3 text-sm max-md:p-2 border-gray-300 h-12 w-full p-3 rounded-md mb-4"
            placeholder="Director Name"
            value={directorName}
            onChange={(e) => setDirectorName(e.target.value)}
            required
          />
          <input
            type="text"
            className="border max-md:h-15 max-md:mb-3 text-sm max-md:p-2 border-gray-300 h-12 w-full p-3 rounded-md mb-4"
            placeholder="Center Code"
            value={centerCode}
            onChange={(e) => setCenterCode(e.target.value)}
            required
          />
          <input
            type="email"
            className="border max-md:h-15 max-md:mb-3 text-sm max-md:p-2 border-gray-300 h-12 w-full p-3 rounded-md mb-4"
            placeholder="College Administration Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="border max-md:h-15 max-md:mb-3 text-sm max-md:p-2 border-gray-300 h-12 w-full p-3 rounded-md mb-4"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Role Selection */}
          <div className="mb-4 max-md:mb-2 max-md:h-15 ">
            <label htmlFor="role" className="block max-md:text-sm max-md:mb-1 max-md:ml-1 text-gray-600 font-medium mb-2">Choose Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 block text-sm  max-md:mb-3 border max-md:h-12 max-md:p-1  max-md:text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option className="max-md:text-sm max-md:text-gray-300 " value="choose">Choose your role</option>

              <option value="Registrar">Registrar</option>
              <option value="Director">Director</option>
              <option value="Teacher">Teacher</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            className="bg-violet-600 max-md:mt-6 max-md:p-1 max-md:text-sm max-md:h-12 text-white font-semibold w-full p-3 rounded-md mt-6"
            type="submit"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {/* Link to Login */}
          <p className="mt-4 max-md:mt-2 max-md:text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/" className="text-blue-600 font-semibold hover:text-blue-800">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default AdminSignUp;
