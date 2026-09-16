import React from "react";
import { Link } from "react-router-dom";

const Logo = () => (
  <Link
    to="/StudentDashboard/dashboard"
    className="group flex select-none items-center gap-2.5 py-1"
  >
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-900 font-display text-[15px] font-bold text-white transition-transform group-hover:scale-105">
      E
    </span>
    <span className="leading-tight">
      <span className="block font-display text-[14.5px] font-bold tracking-tight text-ink-900">
        EduMatrix
      </span>
      <span className="block text-[11px] font-medium text-ink-500">
        Virtual Classroom
      </span>
    </span>
  </Link>
);

export default Logo;