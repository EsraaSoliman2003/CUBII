import React from "react";

const InvoicesFilterTabs = ({ filters, selectedIndex, onChange }) => {
  if (!filters || filters.length === 0) return null;

  const visualFilters = [...filters].reverse();
  const count = filters.length;

  return (
    <div className="w-full flex justify-center" dir="rtl">
      <div className="w-full bg-white shadow-md border border-slate-200 py-2">
        <div className="flex flex-row-reverse justify-center gap-2 px-2">
          {visualFilters.map((filter, idx) => {
            const realIndex = count - 1 - idx;
            const isActive = realIndex === selectedIndex;
            return (
              <button
                key={filter.label}
                type="button"
                onClick={() => onChange(realIndex)}
                className={`
                  px-4 py-2 text-sm font-semibold
                  border border-b-4
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-white text-blue-700 border-blue-600 border-b-blue-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                  }
                `}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InvoicesFilterTabs;
