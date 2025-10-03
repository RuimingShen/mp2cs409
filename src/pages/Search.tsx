import React from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import SortControls from "../components/SortControls";
import { getPokemonList } from "../api/pokeapi";
import type { PokemonListItem } from "../types";

export default function SearchPage() {
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<"name" | "id">("name");
  const [order, setOrder] = React.useState<"asc" | "desc">("asc");
  const [items, setItems] = React.useState<PokemonListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await getPokemonList(300, 0); // preload a chunk
        setItems(list);
      } catch (e) {
        setError("Failed to load Pokémon list");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = items.filter((p) =>
      q ? p.name.includes(q) || String(p.id) === q : true
    );

    out.sort((a, b) => {
      let comp = 0;
      if (sortKey === "name") comp = a.name.localeCompare(b.name);
      else comp = a.id - b.id;
      return order === "asc" ? comp : -comp;
    });

    return out;
  }, [items, query, sortKey, order]);

  return (
    <div className="page">
      <h1>Pokémon Search</h1>
      <p>Filter as you type. Click a card for details.</p>
      <div style={{ display: "grid", gap: 12 }}>
        <SearchBar value={query} onChange={setQuery} placeholder="Name or exact ID" />
        <SortControls sortKey={sortKey} order={order} onSortKey={setSortKey} onOrder={setOrder} />
      </div>

      {loading && <p>Loading…</p>}
      {error && <p role="alert">{error}</p>}

      <div className="grid">
        {filtered.map((p) => (
          <Link key={p.id} to={`/pokemon/${p.id}`} className="card" aria-label={`View ${p.name}`}>
            <img src={p.image} alt={p.name} loading="lazy" />
            <div className="meta">
              <strong>#{p.id}</strong>
              <span style={{ textTransform: "capitalize" }}>{p.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
