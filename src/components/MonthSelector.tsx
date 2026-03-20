"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import Button from "./button";
import { useEffect, useRef, useState } from "react";
import { MONTHS } from "../constants";
import { useDateContext } from "../context/useDateContext";

export default function MonthSelector() {
  const { selectedMonth, setSelectedMonth, setSelectedDate } = useDateContext();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      window.addEventListener("click", handleClickOutside);
    }

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div
      ref={containerRef}
      className="dropdown-container relative"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        width="w-[130px]"
        text={MONTHS[selectedMonth].monthFull}
        className="h-10 bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        iconAfter={
          isDropdownOpen ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )
        }
      />

      {isDropdownOpen && (
        <div
          id="month-dropdown"
          className="absolute top-11 bg-white w-[130px] rounded-lg border border-slate-200 shadow-lg flex flex-col z-50 overflow-hidden"
        >
          {MONTHS.map((month) => (
            <button
              type="button"
              key={month.monthFull}
              className="flex items-center px-3 text-sm text-slate-700 cursor-pointer border-b border-b-slate-100 hover:bg-slate-100 transition-all duration-150 h-10 text-left last:border-b-0"
              onClick={() => {
                const targetMonth = MONTHS.indexOf(month);
                setSelectedMonth(targetMonth);
                setSelectedDate(1);
                sessionStorage.setItem(
                  "selectedMonth",
                  JSON.stringify(targetMonth)
                );
                sessionStorage.setItem("selectedDate", JSON.stringify(1));
                setIsDropdownOpen(false);
              }}
            >
              {month.monthFull}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
