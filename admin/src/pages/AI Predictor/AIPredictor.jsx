import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Loader2 } from "lucide-react";
import AppLayout from "../../layout/AppLayout";

const AIPredictor = () => {
  const [marks, setMarks] = useState("");
  const [attendance, setAttendance] = useState("");
  const [branch, setBranch] = useState("");
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/v9/aiPredictor`, {
        marks,
        attendance,
        branch,
      });

      if (response.data.success) {
        toast.success("Prediction successful!");
        setPrediction(response.data.prediction.result);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4"> {/* Removed ml-[18%], ensured w-full */}
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          AI Predictor
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="marks" className="block text-sm font-medium text-gray-700">
              Marks
            </label>
            <input
              id="marks"
              type="number"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="attendance" className="block text-sm font-medium text-gray-700">
              Attendance
            </label>
            <input
              id="attendance"
              type="number"
              value={attendance}
              onChange={(e) => setAttendance(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
              Branch
            </label>
            <input
              id="branch"
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
              placeholder="e.g., Computer Science"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`${
                loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
              } w-full flex justify-center items-center text-white font-semibold rounded-md px-4 py-2 transition`}
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Predict"}
            </button>
          </div>
        </form>
        {prediction && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="text-lg font-medium text-green-800">Prediction</h3>
            <p className="mt-2 text-green-700">{prediction}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppLayout()(AIPredictor);
