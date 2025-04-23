import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";

type Assignment = {
  _id: string;
  title: string;
  description: string;
  questions: string;
  deadline: string;
  pdfUrl: string;
};

const Assignment: React.FC = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/v7/getAssignment`);
        if (response.data.success) {
          setAssignments(response.data.studentAssignment);
        }
      } catch (error) {
        console.log("Some error occured fetching assignments", error);
      }
    };
    fetchAssignments();
  }, []);
  return (
    <div className="w-[80%] mx-auto px-10 py-8">
      {assignments && assignments.length > 0 ? (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-indigo-700 mb-6 border-b pb-2">
            Available Assignments
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200"
              >
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-blue-700 mb-2 truncate">
                    {assignment.title}
                  </h2>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {assignment.description}
                  </p>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center text-gray-500 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        Deadline:{" "}
                        <span className="font-medium text-gray-700">
                          {new Date(assignment.deadline).toDateString()}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        Questions:{" "}
                        <span className="font-medium text-gray-700">
                          {assignment.questions}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <a
                    href={assignment.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full text-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                  >
                    Download PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-10 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-700 mb-2">
            No Assignments Available
          </h1>
          <p className="text-gray-500">
            There are currently no assignments to display. Check back later!
          </p>
        </div>
      )}
    </div>
  );
};

export default Layout()(Assignment);
