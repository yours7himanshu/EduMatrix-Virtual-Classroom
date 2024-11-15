
import { Bar, Line } from "react-chartjs-2";


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {

  const attendanceData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Attendance (%)",
        data: [90, 85, 80, 88, 95, 92],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const marksData = {
    labels: ["Math", "Science", "History", "English", "Arts"],
    datasets: [
      {
        label: "Marks",
        data: [85, 90, 80, 88, 95],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dashboard  ">

     
 <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Student Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Attendance Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Attendance Overview
          </h2>
          <Bar data={attendanceData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
        </div>

       
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Marks Overview
          </h2>
          <Line data={marksData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
        </div>
      </div>
    </div>
    </div>
   
  );
};

export default Dashboard;
