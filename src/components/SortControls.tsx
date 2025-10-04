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
    <div className="sort-controls">
      <label className="select-inline">
        Sort by:
        <select
          value={sortKey}
          onChange={(e) => onSortKey(e.target.value as SortKey)}
        >
          <option value="name">Name</option>
          <option value="id">ID</option>
        </select>
      </label>

      <label className="select-inline">
        Order:
        <select
          value={order}
          onChange={(e) => onOrder(e.target.value as Order)}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>
    </div>
  );
}
