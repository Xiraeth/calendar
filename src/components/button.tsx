import type { JSX, ReactNode } from "react";
import { clsx } from "clsx";

export default function Button({
  text,
  iconBefore,
  iconAfter,
  onClick,
  width,
  className,
  textClassName,
  type = "button",
}: {
  text: string;
  iconBefore?: ReactNode;
  iconAfter?: ReactNode;
  onClick?: () => void;
  width?: string;
  className?: string;
  textClassName?: string;
  type?: "button" | "submit";
}): JSX.Element {
  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(
        "flex items-center justify-between gap-2 rounded-lg px-4 py-2.5 transition-all duration-150 text-sm font-medium select-none border border-slate-300/80 text-slate-800 shadow-sm  active:scale-[0.98] ",
        width ? width : "w-auto",
        className?.includes("bg-")
          ? className
          : `bg-slate-50/80 hover:bg-slate-100 active:bg-slate-200/70`,
      )}
    >
      {iconBefore}
      <span className={clsx("truncate", textClassName)}>{text}</span>
      {iconAfter}
    </button>
  );
}
