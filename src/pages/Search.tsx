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

  const getRelevanceScore = React.useCallback((pokemon: PokemonListItem, q: string) => {
    const name = pokemon.name.toLowerCase();
    const idMatch = String(pokemon.id) === q;
    if (idMatch) return 0;
    if (name === q) return 1;
    if (name.startsWith(q)) return 2;
    if (name.includes(q)) return 3;
    return 4;
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();

    const decorated = items
      .filter((p) => (q ? p.name.includes(q) || String(p.id) === q : true))
      .map((pokemon) => ({
        pokemon,
        relevance: q
          ? getRelevanceScore(pokemon, q)
          : 0,
      }));

    decorated.sort((a, b) => {
      if (a.relevance !== b.relevance) {
        return a.relevance - b.relevance;
      }

      let comp = 0;
      if (sortKey === "name") {
        comp = a.pokemon.name.localeCompare(b.pokemon.name);
      } else {
        comp = a.pokemon.id - b.pokemon.id;
      }

      return order === "asc" ? comp : -comp;
    });

    return decorated.map((entry) => entry.pokemon);
  }, [items, query, sortKey, order, getRelevanceScore]);

  return (
    <div className="page">
      <h1>Pokémon Search</h1>
      <p>Filter as you type. Results are sorted from most to least relevant.</p>
      <div className="stack-12">
        <SearchBar value={query} onChange={setQuery} placeholder="Name or exact ID" />
        <SortControls sortKey={sortKey} order={order} onSortKey={setSortKey} onOrder={setOrder} />
      </div>

      {loading && <p>Loading…</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p role="status">No Pokémon match your search.</p>
      )}

      <ul className="results-list" role="list">
        {filtered.map((p) => (
          <li key={p.id}>
            <Link
              to={`/pokemon/${p.id}`}
              className="list-item"
              aria-label={`View details for ${p.name}`}
            >
              <img src={p.image} alt={p.name} className="list-thumb" loading="lazy" />
              <div className="list-body">
                <div className="list-text">
                  <span className="list-name cap">{p.name}</span>
                  <span className="list-id">#{p.id}</span>
                </div>
                <span className="list-meta">View details</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
