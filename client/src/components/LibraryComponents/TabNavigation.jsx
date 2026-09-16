import React from "react";
import { ArrowDownCircle, ArrowUpCircle, Search } from "lucide-react";

const TABS = [
  { name: "browse", icon: Search, label: "Browse catalog" },
  { name: "borrow", icon: ArrowDownCircle, label: "Borrow book" },
  { name: "return", icon: ArrowUpCircle, label: "Return book" },
];

const TabNavigation = ({ activeTab, setActiveTab }) => (
  <div className="border-b border-ink-900/[0.08] px-5 sm:px-6">
    <div className="no-scrollbar flex items-center gap-6 overflow-x-auto">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.name;
        return (
          <button
            key={tab.name}
            type="button"
            onClick={() => setActiveTab(tab.name)}
            aria-current={active ? "page" : undefined}
            className={`relative inline-flex h-12 shrink-0 items-center gap-2 text-[13px] transition-colors ${
              active
                ? "font-semibold text-ink-900"
                : "font-medium text-ink-500 hover:text-ink-900"
            }`}
          >
            <Icon size={14} />
            {tab.label}
            <span
              className={`absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-ink-900 transition-opacity duration-200 ${
                active ? "opacity-100" : "opacity-0"
              }`}
            />
          </button>
        );
      })}
    </div>
  </div>
);

export default TabNavigation;