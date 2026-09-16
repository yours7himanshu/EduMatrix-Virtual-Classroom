import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const StatusMessage = ({ message }) => {
  if (!message?.text) return null;

  const isError = message.isError;
  return (
    <div
      role="status"
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[12.5px] font-medium ${
        isError
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {isError ? (
        <AlertCircle size={16} className="mt-px shrink-0" />
      ) : (
        <CheckCircle2 size={16} className="mt-px shrink-0" />
      )}
      <p className="leading-relaxed">{message.text}</p>
    </div>
  );
};

export default StatusMessage;