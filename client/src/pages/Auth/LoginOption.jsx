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



import React from 'react';
import { Waves, ShieldCheck } from 'lucide-react';

const LoginOption = ({ 
  icon: Icon, 
  title, 
  description, 
  bgColor, 
  onClick,
  borderColor,
  
}) => {
  return (
    <div 
      
      className={`
        relative 
        
        w-80 
        h-[420px] 
        rounded-2xl 
        p-6 
        flex 
        flex-col 
        justify-between 
        cursor-pointer 
        transition-all 
        duration-300 
        transform 
       max-md:h-[90%]
        bg-white 
        overflow-hidden
        max-md:gap-9
      `}
    >
      {/* Background Wave Effect */}
      <Waves 
        className={`
          absolute 
          -top-10 
          -right-10 
          w-40 
          h-40 
          opacity-10 
          ${bgColor}
        `}
      />

      {/* Top Section */}
      <div className=" z-10 flex justify-between items-start">
        <div 
          className={`
            w-20 
            h-20 
            rounded-full 
            flex 
            items-center 
            justify-center 
            ${bgColor} 
            bg-opacity-20
          `}
        >
          <Icon 
            className={`
              w-10 
              h-10 
             
            `}
          />
        </div>
       
      </div>

      {/* Content */}
      <div className="relative z-10 mt-4">
        <h2 
          className={`
            text-2xl 
            font-bold 
            mb-3 
    
          `}
        >
          {title}
        </h2>
        <p 
          className={`
            text-sm 
     
          `}
        >
          {description}
        </p>
      </div>

      {/* Bottom Section */}
      <button 
      onClick={onClick}
        className={`
          w-full 
          py-3 
          rounded-lg 
          transition-all 
          duration-300 
          text-white
          bg-indigo-700
        `}
      >
       {title}
      </button>
    </div>
  );
};

export default LoginOption;

