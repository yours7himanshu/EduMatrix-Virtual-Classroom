import { useState, useEffect } from "react";
import axios from "axios";

function Announcement() {
  const [announcement, setAnnouncement] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/v3/displayAnnouncement`);
        if (response.data.success) {
          console.log(response.data.getAnnouncement);
          setAnnouncement(response.data.getAnnouncement);
        }
      } catch (error) {
        console.log("Error fetching Announcement", error);
      }
    };
    fetchAnnouncement();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-8">
      <h1 className="text-4xl font-bold text-center text-blue-700 mb-10">
        College Announcements
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {announcement.map((value, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                {value.category}
              </h3>
              <div className="text-gray-600 mb-4">
                <p className="flex items-center space-x-2">
                  <span className="font-medium text-blue-600">Course:</span>
                  <span>{value.course}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="font-medium text-blue-600">Branch:</span>
                  <span>{value.branch}</span>
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">{value.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Announcement;
