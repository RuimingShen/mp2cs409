import React from "react";

export interface SortOption<T extends string = string> {
  label: string;
  value: T;
}

export interface SortControlProps<T extends string = string>
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Options for the dropdown (e.g., ID, Name, Height, Weight, Base XP) */
  options: SortOption<T>[];
  /** Current selected sort key */
  value: T;
  /** Ascending flag */
  asc: boolean;
  /** Called when sort key changes */
  onChangeValue: (value: T) => void;
  /** Called when ascending/descending toggles */
  onToggleAsc: () => void;
  /** Optional label text */
  label?: string;
}

/** Select + asc/desc toggle used in the ListView header */
export default function SortControl<T extends string = string>({
  options,
  value,
  asc,
  onChangeValue,
  onToggleAsc,
  label = "Sort by",
  className = "",
  ...rest
}: SortControlProps<T>) {
  return (
    <div className={`inline-flex flex-col ${className}`} {...rest}>
      <label className="block text-sm font-medium">{label}</label>
      <div className="mt-1 flex gap-2">
        <select
          className="rounded-xl border p-2"
          value={value}
          onChange={(e) => onChangeValue(e.target.value as T)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="rounded-xl border px-3 py-2"
          onClick={onToggleAsc}
          title="Toggle ascending/descending"
          aria-label={asc ? "Ascending. Click to switch to descending." : "Descending. Click to switch to ascending."}
        >
          {asc ? "↑" : "↓"}
        </button>
      </div>
    </div>
  );
}
