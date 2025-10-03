import React from "react";

type SortKey = "name" | "id";
type Order = "asc" | "desc";

interface Props {
  sortKey: SortKey;
  order: Order;
  onSortKey: (k: SortKey) => void;
  onOrder: (o: Order) => void;
}

export default function SortControls({ sortKey, order, onSortKey, onOrder }: Props) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <label>
        Sort by:
        <select
          value={sortKey}
          onChange={(e) => onSortKey(e.target.value as SortKey)}
          style={{ marginLeft: 8 }}
        >
          <option value="name">Name</option>
          <option value="id">ID</option>
        </select>
      </label>

      <label>
        Order:
        <select
          value={order}
          onChange={(e) => onOrder(e.target.value as Order)}
          style={{ marginLeft: 8 }}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>
    </div>
  );
}
