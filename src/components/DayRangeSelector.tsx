"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "./button";
import { getAllowedVisibleDayOptionsForWidth } from "../calendarConfig";
import { useDateContext } from "../context/useDateContext";

export default function DayRangeSelector() {
  const { visibleDayCount, setVisibleDayCount } = useDateContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1024 : window.innerWidth,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const allowedOptions = getAllowedVisibleDayOptionsForWidth(viewportWidth);
  const hasMultipleOptions = allowedOptions.length > 1;

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

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="dropdown-container relative"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        width="w-[96px] sm:w-[110px]"
        text={`${visibleDayCount}-day`}
        className="h-10 bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
        onClick={() => {
          if (!hasMultipleOptions) {
            return;
          }
          setIsDropdownOpen((prev) => !prev);
        }}
        iconAfter={
          !hasMultipleOptions ? null : isDropdownOpen ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )
        }
      />

      {isDropdownOpen && hasMultipleOptions && (
        <div className="absolute top-11 bg-white w-[96px] sm:w-[110px] rounded-lg border border-slate-200 shadow-lg flex flex-col z-50 overflow-hidden">
          {allowedOptions.map((option) => (
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
