import React from "react";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** A number between 0 and 1. If not provided, will compute from done/total. */
  ratio?: number;
  /** Completed units (alternative to `ratio`) */
  done?: number;
  /** Total units (alternative to `ratio`) */
  total?: number;
  /** Show numeric text (e.g., "42%") on the right side */
  showText?: boolean;
  /** Optional label left of the bar */
  label?: React.ReactNode;
}

/**
 * Accessible progress bar with simple styling.
 * Use either `ratio` (0..1) or `done` + `total`.
 */
export default function ProgressBar({
  ratio,
  done,
  total,
  showText = false,
  label,
  className = "",
  ...rest
}: ProgressBarProps) {
  const computed =
    typeof ratio === "number"
      ? Math.max(0, Math.min(1, ratio))
      : total && total > 0 && typeof done === "number"
      ? Math.max(0, Math.min(1, done / total))
      : 0;

  const percent = Math.round(computed * 100);

  return (
    <div className={`w-full ${className}`} {...rest}>
      {label ? (
        <div className="mb-1 flex items-center justify-between text-sm">
          <div>{label}</div>
          {showText && <div className="text-gray-600">{percent}%</div>}
        </div>
      ) : (
        showText && <div className="mb-1 text-right text-sm text-gray-600">{percent}%</div>
      )}
      <div
        className="h-2 w-full rounded bg-gray-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className="h-2 rounded bg-black"
          style={{ width: `${percent}%` }}
        />
      </div>
      {typeof done === "number" && typeof total === "number" && (
        <div className="mt-1 text-right text-xs text-gray-600">
          {done}/{total}
        </div>
      )}
    </div>
  );
}
