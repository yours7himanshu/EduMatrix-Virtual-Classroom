import { useState, useEffect } from "react";
import axios from "axios";

const Payfees = () => {
  const [student, setStudent] = useState(null);
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fees = {
    cse: 150000,
    ece: 140000,
    me: 130000,
    ce: 120000,
    it: 125000,
  };

  const handlePay = async () => {
    if (!year || !student) return alert("Please select a year.");
    try {
      setLoading(true);
      const url = import.meta.env.VITE_BACKEND_URL + "/api/v10/payfees";
      const response = await axios.post(
        url,
        {
          studentId: student._id,
          amount: fees[student.branch.toLowerCase()],
          rollno: student.rollNo,
          email: student.email,
          year,
        },
        {
          headers: { token: localStorage.getItem("token") },
        }
      );
      if (response.data.success) {
        window.location.replace(response.data.url);
      }
    } catch (error) {
      console.log("Payment error:", error);
      alert("Payment initiation failed.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudent = async () => {
    try {
      // const url = import.meta.env.VITE_BACKEND_URL + "/api/v5/student-byid";
      const response = await axios.post(
        `${backendUrl}/api/v5/student-byid`,
        {},
        {
          headers: { token: localStorage.getItem("token") },
        }
      );
      console.log(response.data);
      setStudent(response.data.studentdetails);
    } catch (error) {
      console.log("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white backdrop-blur-lg rounded-3xl shadow-2xl p-8 transform hover:scale-[1.02] transition-transform duration-300">
          <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8">
            Fee Payment Portal
          </h2>

          {student ? (
            <>
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center border-b border-gray-100 pb-4">
                    <span className="text-gray-600 w-24">Name:</span>
                    <span className="font-semibold text-gray-800">
                      {student.name}
                    </span>
                  </div>
                  <div className="flex items-center border-b border-gray-100 pb-4">
                    <span className="text-gray-600 w-24">Roll No:</span>
                    <span className="font-semibold text-gray-800">
                      {student.rollNo}
                    </span>
                  </div>
                  <div className="flex items-center border-b border-gray-100 pb-4">
                    <span className="text-gray-600 w-24">Email:</span>
                    <span className="font-semibold text-gray-800">
                      {student.email}
                    </span>
                  </div>
                  <div className="flex items-center border-b border-gray-100 pb-4">
                    <span className="text-gray-600 w-24">Branch:</span>
                    <span className="font-semibold text-gray-800">
                      {student.branch.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 w-24">Fees:</span>
                    <span className="font-bold text-2xl text-blue-600">
                      ₹{fees[student.branch.toLowerCase()].toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Select Academic Year
                </label>
                <div className="relative">
                  <select
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="">-- Select Year --</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:translate-y-[-2px] ${
                  loading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Proceed to Payment"
                )}
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payfees;
