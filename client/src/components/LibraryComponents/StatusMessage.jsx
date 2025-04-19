import React from "react";
import { AlertCircle } from "lucide-react";

const StatusMessage = ({ message, isError }) => {
  if (!message.text) return null;
  
  const CheckCircle = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
  
  return (
    <div className={`mt-3 p-3 rounded-lg flex items-start space-x-2 ${
      isError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
    }`}>
      {isError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
      <p className="text-sm">{message.text}</p>
    </div>
  );
};

export default StatusMessage;