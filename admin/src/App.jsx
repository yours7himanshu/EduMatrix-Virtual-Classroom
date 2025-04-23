/*

Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


import React, { Suspense, lazy, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Lottie from "lottie-react";
import "react-toastify/dist/ReactToastify.css";

import loadingAnimation from "./assets/loading.json";
import NotFound from "./pages/NotFound";
import Message from "./shared/Message";

const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminSignUp = lazy(() => import("./pages/AdminSignUp"));
const AddTeacher = lazy(() => import("./components/Teachers/AddTeacher"));
const Announcement = lazy(() => import("./pages/Announcement"));
const Students = lazy(() => import("./components/Student/Students"));
const TimeTable = lazy(() => import("./components/TimeTable"));
const AdminLive = lazy(() => import("./components/AdminLive"));
const CreateQuiz = lazy(() => import("./components/Quiz/CreateQuiz"));
const Assignment = lazy(() => import("./components/Assignment/Assignment"));
const DashboardPage = lazy(() =>
  import("./components/Dashboard/DashboardPage")
);
const Teachers = lazy(() => import("./components/Teachers/Teachers"));
const StudentDetail = lazy(() => import("./components/Student/StudentDetail"));
import { PeerProvider } from "./providers/Peer";
import { SocketProvider } from "./providers/Socket";

import MainLayout from "./components/library_dashboard/MainLayout";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import QuestionGenerator from "./pages/QuestionGenerator";
import StudentMarksAttendance from "./components/Teachers/StudentMarksAttendance";
import RegistrarStudent from "./components/Registrar/RegistrarStudent";
import AIPredictor from "./pages/AI Predictor/AIPredictor";
import DirectorFeedback from "./components/Director/DirectorFeedback";




const Loader = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <Lottie
        animationData={loadingAnimation}
        loop={true}
        className="w-20 h-20"
      />
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app">
      <ToastContainer />

      {isLoading ? (
        <Loader />
      ) : (
        <Suspense fallback={<Loader />}>
          <SocketProvider>
            <PeerProvider>
              <Routes>
                <Route path="/" element={<AdminLogin />} />
                <Route path="/sign-up" element={<AdminSignUp />} />

                <Route path="/MainLayout" element={<MainLayout />} />


                <Route path='/question-generator' element={<QuestionGenerator/>}/>
                <Route path="/teachers" element={<ProtectedRoute element={<Teachers/>} />} />
                <Route path="/enroll-students" element={<ProtectedRoute element={<Students/>} />} />
                <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage/>}/>} />
                <Route path="/add-teachers" element={<ProtectedRoute element={<AddTeacher/>} />} />
                <Route path="/announcement" element={<ProtectedRoute element={<Announcement/>} />} />
                <Route path="/timetable" element={<ProtectedRoute element={<TimeTable/>} />} />
                <Route path="/admin-live/:roomId" element={<ProtectedRoute element={<AdminLive/>} />} />
                <Route path="/post-quiz" element={<ProtectedRoute element={<CreateQuiz/>} />} />
                <Route path="/post-assignment" element={<ProtectedRoute element={<Assignment/>} />} />
                <Route path="/student-detail" element={<ProtectedRoute element={<StudentDetail/>} />} />
                <Route path="/messages" element={<ProtectedRoute element={<Message/>} />} />
                <Route path="/student-marks-attendance" element={<ProtectedRoute element={<StudentMarksAttendance/>} />} />
                <Route path="/registrar-student" element={<ProtectedRoute element={<RegistrarStudent/>} />} />
                <Route path="/ai-predictor" element={<ProtectedRoute element={<AIPredictor/>} />} />
                <Route path="/director-feedback" element={<ProtectedRoute element={<DirectorFeedback/>} />} />


                <Route path="*" element={<NotFound />} />
              </Routes>
            </PeerProvider>
          </SocketProvider>
        </Suspense>
      )}
    </div>
  );
}

export default App;
