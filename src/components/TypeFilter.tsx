import React from "react";

interface Props {
  allTypes: string[];
  selected: string[];
  onToggle: (t: string) => void;
  onClear: () => void;
}

export default function TypeFilter({ allTypes, selected, onToggle, onClear }: Props) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {allTypes.map((t) => (
          <button
            key={t}
            onClick={() => onToggle(t)}
            aria-pressed={selected.includes(t)}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: selected.includes(t) ? "2px solid #4f46e5" : "1px solid #ddd",
              background: selected.includes(t) ? "#eef2ff" : "#fff",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <button onClick={onClear} style={{ marginTop: 8, padding: "4px 8px" }}>
          Clear filters
        </button>
      )}
    </div>
  );
}
