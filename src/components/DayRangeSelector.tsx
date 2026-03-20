"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "./button";
import { VISIBLE_DAY_OPTIONS } from "../calendarConfig";
import { useDateContext } from "../context/useDateContext";

export default function DayRangeSelector() {
  const { visibleDayCount, setVisibleDayCount } = useDateContext();
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
        width="w-[110px]"
        text={`${visibleDayCount}-day`}
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
        <div className="absolute top-11 bg-white w-[110px] rounded-lg border border-slate-200 shadow-lg flex flex-col z-50 overflow-hidden">
          {VISIBLE_DAY_OPTIONS.map((option) => (
            <button
              type="button"
              key={option}
              className="flex items-center px-3 text-sm text-slate-700 cursor-pointer border-b border-b-slate-100 hover:bg-slate-100 transition-all duration-150 h-10 text-left last:border-b-0"
              onClick={() => {
                setVisibleDayCount(option);
                sessionStorage.setItem("visibleDayCount", String(option));
                setIsDropdownOpen(false);
              }}
            >
              {option}-day
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
