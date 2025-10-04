import React from "react";

interface Props {
  allTypes: string[];
  selected: string[];
  onToggle: (t: string) => void;
  onClear: () => void;
}

export default function TypeFilter({ allTypes, selected, onToggle, onClear }: Props) {
  return (
    <div className="type-filter">
      <div className="type-chips">
        {allTypes.map((t) => (
          <button
            key={t}
            onClick={() => onToggle(t)}
            aria-pressed={selected.includes(t)}
            className="type-chip"
          >
            {t}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <button onClick={onClear} className="type-clear">
          Clear filters
        </button>
      )}
    </div>
  );
}
