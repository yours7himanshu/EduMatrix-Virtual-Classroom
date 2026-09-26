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
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-md bg-white p-5 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6 tracking-tight">
          AI Predictor
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="marks" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              Marks
            </label>
            <input
              id="marks"
              type="number"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              required
              className="block w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs transition"
            />
          </div>
          <div>
            <label htmlFor="attendance" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              Attendance (%)
            </label>
            <input
              id="attendance"
              type="number"
              value={attendance}
              onChange={(e) => setAttendance(e.target.value)}
              required
              className="block w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs transition"
            />
          </div>
          <div>
            <label htmlFor="branch" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              Branch
            </label>
            <input
              id="branch"
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
              placeholder="e.g., Computer Science"
              className="block w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs transition"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`${
                loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
              } w-full flex justify-center items-center text-white font-semibold rounded-xl py-3 text-sm sm:text-base shadow-md hover:shadow-lg transition cursor-pointer`}
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Predict Outcome"}
            </button>
          </div>
        </form>
        {prediction && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <h3 className="text-base font-bold text-emerald-800">Prediction Result</h3>
            <p className="mt-1.5 text-sm text-emerald-700 font-medium">{prediction}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppLayout()(AIPredictor);
