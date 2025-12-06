import React from "react";

const InvoicesFilterTabs = ({ filters, selectedIndex, onChange }) => {
  if (!filters || filters.length === 0) return null;

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-5xl bg-slate-50 rounded-lg shadow-sm overflow-x-auto">
        <div className="flex flex-row-reverse gap-2 p-2">
          {filters.map((filter, index) => {
            const isActive = index === selectedIndex;
            return (
              <button
                key={filter.label}
                type="button"
                onClick={() => onChange(index)}
                className={`whitespace-nowrap px-3 py-2 rounded-md text-sm font-semibold border transition
                  ${
                    isActive
                      ? "bg-white text-amber-600 border-amber-400 shadow"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
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
