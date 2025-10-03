import React from "react";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Text inside the chip */
  label: string;
  /** Visual selected state (for filters) */
  selected?: boolean;
  /** If true, renders as a <span> instead of a clickable <button> */
  asSpan?: boolean;
}

/**
 * Small pill used for types/abilities or as a toggleable filter chip.
 * - Use `asSpan` for read-only display chips.
 * - Use `selected` to invert colors when active.
 */
export default function Chip({
  label,
  selected = false,
  asSpan = false,
  className = "",
  ...rest
}: ChipProps) {
  const base =
    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs capitalize";
  const selectedCls = selected ? "bg-black text-white" : "bg-white";

  if (asSpan) {
    return <span className={`${base} ${selectedCls} ${className}`}>{label}</span>;
  }

  return (
    <button
      type="button"
      className={`${base} ${selectedCls} ${className}`}
      aria-pressed={selected}
      {...rest}
    >
      {label}
    </button>
  );
}
