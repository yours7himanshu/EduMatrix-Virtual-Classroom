import React, { useState } from 'react';
import { LockKeyhole, GraduationCap, Waves } from 'lucide-react';
import LoginOption from '../components/LoginOption';

const MainLoginPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  return (
    <div 
      className="
        min-h-screen 
        bg-gradient-to-br 
        from-blue-50 
        to-blue-100 
        flex 
        items-center 
        justify-center 
        p-4 
        relative 
        overflow-hidden
      "
    >
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
          flex 
          space-x-8 
          z-10 
          relative 
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
          isSelected={selectedRole === 'Student Login'}
          onSelect={() => handleRoleSelect('Student Login')}
        />
        <LoginOption 
          icon={LockKeyhole}
          title="Admin Login"
          description="Manage system, users, and administrative functions"
          bgColor="text-green-500"
          borderColor="border-green-500"
          isSelected={selectedRole === 'Admin Login'}
          onSelect={() => handleRoleSelect('Admin Login')}
        />
      </div>
    </div>
  );
};

export default MainLoginPage;