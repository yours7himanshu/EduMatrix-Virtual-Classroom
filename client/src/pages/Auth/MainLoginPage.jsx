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



import React, { useState } from 'react';
import { LockKeyhole, GraduationCap, Waves } from 'lucide-react';
import LoginOption from './LoginOption';
import { useNavigate } from 'react-router-dom';
import ModalComponent from "../../Modal/ModalComponent";

const MainLoginPage = () => {
 
const navigate = useNavigate();
  return (
    <div 
      className="
        min-h-screen 
        bg-gradient-to-b 
       from-slate-950
       to-indigo-950
        flex 
        
        items-center 
        justify-center 
        p-4 
        relative 
        overflow-hidden
      "
    >
      <ModalComponent/>
      {/* Floating Decorative Circles */}
      <div 
        className="
          absolute 
          -top-20 
          -left-20 
          w-96 
          h-96 
          bg-blue-200 
          rounded-full 
          opacity-30 
          blur-3xl
        "
      />
      <div 
        className="
          absolute 
          -bottom-20 
          -right-20 
          w-96 
          h-96 
          bg-blue-300 
          rounded-full 
          opacity-30 
          blur-3xl
        "
      />

      {/* Login Options Container */}
      <div 
        className="
        max-md:flex-col-reverse
        flex-row-reverse
        gap-11
         mt-16
          flex 
          max-md:gap-5
          space-x-8 
          z-10 
          relative
          max-md:space-x-0
          items-center 
          justify-center
        "
      >
        <LoginOption 
          icon={GraduationCap}
          title="Student Login"
          description="Access academic resources, courses, and personal dashboard"
          bgColor="text-blue-500"
          borderColor="border-blue-500"
          onClick={ ()=> navigate("/login")}
          
        />
        <LoginOption 
          icon={LockKeyhole}
          title="Admin Login"
          description="Manage system, users, and administrative functions"
          bgColor="text-green-500"
          borderColor="border-green-500"
          onClick={()=>{window.location.href="https://virtual-classroom-admin.vercel.app"}}
        />
      </div>
    </div>
  );
};

export default MainLoginPage;