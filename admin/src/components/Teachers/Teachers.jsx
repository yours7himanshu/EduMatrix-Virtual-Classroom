import axios from 'axios';
import React, { useEffect, useState } from 'react';

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/v4/teacher-detail`,{
          withCredentials:true,
        });
        if (response.data.success) {
          setTeachers(response.data.teacherDetail);
          console.log(response.data.teacherDetail);
        }
      } catch (error) {
        console.log('Some error occurred', error);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <div className="container my-1 px-4 py-8">
     
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-violet-800 text-white text-left">
              <th className="px-6 py-3 text-sm font-semibold">Teacher Name</th>
              <th className="px-6 py-3 text-sm font-semibold">Qualifications</th>
              <th className="px-6 py-3 text-sm font-semibold">Subject</th>
              <th className="px-6 py-3 text-sm font-semibold">Experience</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-gray-100'
                } hover:bg-gray-200 transition-colors`}
              >
                <td className="px-6 py-4 text-gray-700">{teacher.name}</td>
                <td className="px-6 py-4 text-gray-700">{teacher.qualification}</td>
                <td className="px-6 py-4 text-gray-700">{teacher.subject}</td>
                <td className="px-6 py-4 text-gray-700">{teacher.experience} years</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Teachers;
