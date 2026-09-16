import React from "react";
import { FieldLabel, inputClass } from "../../Student Dashboard/Shared/ui";

const FormField = ({ label, placeholder, value, onChange, icon, id }) => (
  <div>
    <FieldLabel htmlFor={id}>{label}</FieldLabel>
    <div className="relative">
      {icon ? (
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-400">
          {icon}
        </span>
      ) : null}
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${inputClass} ${icon ? "pl-10" : ""}`}
      />
    </div>
  </div>
);

export default FormField;