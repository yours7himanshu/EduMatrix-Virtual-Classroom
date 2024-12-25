import React from 'react';
import { Waves, ShieldCheck } from 'lucide-react';

const LoginOption = ({ 
  icon: Icon, 
  title, 
  description, 
  bgColor, 
  borderColor,
  isSelected, 
  onSelect 
}) => {
  return (
    <div 
      onClick={onSelect}
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
        ${isSelected 
          ? `scale-105 shadow-2xl border-4 ${borderColor}` 
          : 'hover:scale-105 shadow-lg border border-gray-200'}
        bg-white 
        overflow-hidden
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
      <div className="relative z-10 flex justify-between items-start">
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
              ${isSelected ? 'text-white' : 'text-gray-700'}
            `}
          />
        </div>
        {isSelected && (
          <div className="text-green-500">
            <ShieldCheck className="w-8 h-8" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 mt-4">
        <h2 
          className={`
            text-2xl 
            font-bold 
            mb-3 
            ${isSelected ? 'text-blue-800' : 'text-gray-800'}
          `}
        >
          {title}
        </h2>
        <p 
          className={`
            text-sm 
            ${isSelected ? 'text-blue-600' : 'text-gray-500'}
          `}
        >
          {description}
        </p>
      </div>

      {/* Bottom Section */}
      <button 
        className={`
          w-full 
          py-3 
          rounded-lg 
          transition-all 
          duration-300 
          ${isSelected 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
        `}
      >
        {isSelected ? 'Proceed to Login' : 'Select Role'}
      </button>
    </div>
  );
};

export default LoginOption;

