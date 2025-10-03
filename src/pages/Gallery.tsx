import React from "react";
import { Link } from "react-router-dom";
import { getAllTypes, getPokemonByType, getPokemonList } from "../api/pokeapi";
import type { PokemonListItem } from "../types";
import TypeFilter from "../components/TypeFilter";

export default function GalleryPage() {
  const [allTypes, setAllTypes] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [items, setItems] = React.useState<PokemonListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const t = await getAllTypes();
      setAllTypes(t);
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (selected.length === 0) {
          // default: show a nice grid of the first 60
          setItems(await getPokemonList(60, 0));
          return;
        }

        // Fetch each type list, merge unique (OR filter)
        const byType = await Promise.all(selected.map((t) => getPokemonByType(t, 80)));
        const merged = new Map<number, PokemonListItem>();
        byType.flat().forEach((p) => merged.set(p.id, p));
        setItems(Array.from(merged.values()).slice(0, 120));
      } catch (e) {
        setError("Failed to load gallery");
      } finally {
        setLoading(false);
      }
    })();
  }, [selected]);

  const toggle = (t: string) =>
    setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  return (
    <div className="page">
      <h1>Gallery</h1>
      <p>Select one or more types to filter.</p>

      <TypeFilter allTypes={allTypes} selected={selected} onToggle={toggle} onClear={() => setSelected([])} />

      {loading && <p>Loading…</p>}
      {error && <p role="alert">{error}</p>}

      <div className="grid">
        {items.map((p) => (
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
