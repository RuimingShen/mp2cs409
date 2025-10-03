import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate, useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";

/**
 * App wraps BrowserRouter inside (so use the Option A main.tsx I gave you).
 *
 * How to run (Vite + React + TS):
 *   npm i axios react-router-dom
 *   npm run dev
 */

// -----------------------------
// Types
// -----------------------------
interface NamedAPIResource { name: string; url: string }
interface PokemonType { slot: number; type: NamedAPIResource }
interface PokemonAbility { ability: NamedAPIResource; is_hidden: boolean; slot: number }
interface PokemonStat { base_stat: number; stat: { name: string } }
interface PokemonSprites {
  other?: { [k: string]: { front_default?: string | null } };
  front_default?: string | null;
}
export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: PokemonType[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
}

// -----------------------------
// Axios instance & helpers
// -----------------------------
const api = axios.create({ baseURL: "https://pokeapi.co/api/v2" });
const POKEMON_LIMIT = 251; // Gen 1-2 for snappy demo
const CACHE_VERSION = "v1";

function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.fetchedAt && Date.now() - parsed.fetchedAt < 7 * 24 * 60 * 60 * 1000) {
      return parsed.data as T;
    }
    return null;
  } catch {
    return null;
  }
}

function cacheSet<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, fetchedAt: Date.now() }));
  } catch {}
}

async function fetchPokemonDetail(idOrName: string | number): Promise<PokemonDetail> {
  const key = `poke_detail_${CACHE_VERSION}_${idOrName}`;
  const cached = cacheGet<PokemonDetail>(key);
  if (cached) return cached;
  const { data } = await api.get<PokemonDetail>(`/pokemon/${idOrName}`);
  cacheSet(key, data);
  return data;
}

async function fetchPokemonList(limit = POKEMON_LIMIT): Promise<NamedAPIResource[]> {
  const key = `poke_list_${CACHE_VERSION}_${limit}`;
  const cached = cacheGet<NamedAPIResource[]>(key);
  if (cached) return cached;
  const { data } = await api.get<{ results: NamedAPIResource[] }>(`/pokemon?limit=${limit}&offset=0`);
  cacheSet(key, data.results);
  return data.results;
}

// concurrency-limited mapper
async function pMap<I, O>(
  items: I[],
  mapper: (item: I) => Promise<O>,
  concurrency = 8,
  onProgress?: (done: number, total: number) => void
): Promise<O[]> {
  const results: O[] = new Array(items.length);
  let i = 0, done = 0;
  onProgress?.(0, items.length);
  async function worker() {
    while (true) {
      const idx = i++;
      if (idx >= items.length) break;
      try {
        results[idx] = await mapper(items[idx]);
      } finally {
        done++;
        onProgress?.(done, items.length);
      }
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, worker);
  await Promise.all(workers);
  return results;
}

// -----------------------------
// Mock fallback (if API is down)
// -----------------------------
const MOCK: PokemonDetail[] = [
  {
    id: 1,
    name: "bulbasaur",
    height: 7,
    weight: 69,
    base_experience: 64,
    types: [{ slot: 1, type: { name: "grass", url: "" } }, { slot: 2, type: { name: "poison", url: "" } }],
    abilities: [{ ability: { name: "overgrow", url: "" }, is_hidden: false, slot: 1 }],
    stats: [
      { base_stat: 45, stat: { name: "hp" } },
      { base_stat: 49, stat: { name: "attack" } },
      { base_stat: 49, stat: { name: "defense" } },
      { base_stat: 65, stat: { name: "special-attack" } },
      { base_stat: 65, stat: { name: "special-defense" } },
      { base_stat: 45, stat: { name: "speed" } },
    ],
    sprites: { other: { "official-artwork": { front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" } }, front_default: null },
  },
  {
    id: 4,
    name: "charmander",
    height: 6,
    weight: 85,
    base_experience: 62,
    types: [{ slot: 1, type: { name: "fire", url: "" } }],
    abilities: [{ ability: { name: "blaze", url: "" }, is_hidden: false, slot: 1 }],
    stats: [
      { base_stat: 39, stat: { name: "hp" } },
      { base_stat: 52, stat: { name: "attack" } },
      { base_stat: 43, stat: { name: "defense" } },
      { base_stat: 60, stat: { name: "special-attack" } },
      { base_stat: 50, stat: { name: "special-defense" } },
      { base_stat: 65, stat: { name: "speed" } },
    ],
    sprites: { other: { "official-artwork": { front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png" } }, front_default: null },
  },
  {
    id: 7,
    name: "squirtle",
    height: 5,
    weight: 90,
    base_experience: 63,
    types: [{ slot: 1, type: { name: "water", url: "" } }],
    abilities: [{ ability: { name: "torrent", url: "" }, is_hidden: false, slot: 1 }],
    stats: [
      { base_stat: 44, stat: { name: "hp" } },
      { base_stat: 48, stat: { name: "attack" } },
      { base_stat: 65, stat: { name: "defense" } },
      { base_stat: 50, stat: { name: "special-attack" } },
      { base_stat: 64, stat: { name: "special-defense" } },
      { base_stat: 43, stat: { name: "speed" } },
    ],
    sprites: { other: { "official-artwork": { front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png" } }, front_default: null },
  },
];

// -----------------------------
// Data Hook
// -----------------------------
function usePokemonData() {
  const [list, setList] = useState<PokemonDetail[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const names = await fetchPokemonList(POKEMON_LIMIT);
        const details = await pMap(
          names,
          async (item) => {
            const name = item.name;
            try {
              return await fetchPokemonDetail(name);
            } catch (e) {
              const mock = MOCK.find(m => m.name === name);
              if (mock) return mock;
              throw e;
            }
          },
          8,
          (done, total) => !cancelled && setProgress({ done, total })
        );
        if (!cancelled) {
          setList(details.sort((a, b) => a.id - b.id));
          setError(null);
        }
      } catch (err) {
        const e = err as AxiosError;
        console.error(e);
        if (!cancelled) {
          setError("Failed to load from PokeAPI. Showing a small mocked set.");
          setList(MOCK);
        }
      } finally {
        !cancelled && setLoading(false);
      }
    }
    run();
    return () => { cancelled = true };
  }, []);

  const allTypes = useMemo(() => {
    const set = new Set<string>();
    (list ?? []).forEach(p => p.types.forEach(t => set.add(t.type.name)));
    return Array.from(set).sort();
  }, [list]);

  return { list, loading, error, progress, allTypes } as const;
}

// -----------------------------
// Small UI helpers
// -----------------------------
const Chip: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs capitalize">{label}</span>
);

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-2xl border p-4 shadow-sm bg-white/60 backdrop-blur">
    {children}
  </div>
);

function useDebounced<T>(value: T, delay = 0) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

function imgFor(p: PokemonDetail): string | undefined {
  return (
    p.sprites?.other?.["official-artwork"]?.front_default ?? p.sprites?.front_default ?? undefined
  ) ?? undefined;
}

// -----------------------------
// List View
// -----------------------------
const ListView: React.FC<{ data: PokemonDetail[] }> = ({ data }) => {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"id" | "name" | "height" | "weight" | "base_experience">("id");
  const [asc, setAsc] = useState(true);
  const debounced = useDebounced(query, 0); // filter as you type
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    let arr = !q ? data : data.filter(p => p.name.includes(q) || String(p.id) === q);
    arr = arr.slice().sort((a, b) => {
      const va = (a as any)[sortKey];
      const vb = (b as any)[sortKey];
      if (va < vb) return asc ? -1 : 1;
      if (va > vb) return asc ? 1 : -1;
      return a.name.localeCompare(b.name) * (asc ? 1 : -1);
    });
    return arr;
  }, [data, debounced, sortKey, asc]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium">Search Pokémon</label>
          <input
            className="mt-1 w-full rounded-xl border p-2"
            placeholder="e.g. pikachu or 25"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Sort by</label>
          <div className="mt-1 flex gap-2">
            <select className="rounded-xl border p-2" value={sortKey} onChange={(e) => setSortKey(e.target.value as any)}>
              <option value="id">ID</option>
              <option value="name">Name</option>
              <option value="height">Height</option>
              <option value="weight">Weight</option>
              <option value="base_experience">Base XP</option>
            </select>
            <button
              className="rounded-xl border px-3 py-2"
              onClick={() => setAsc(a => !a)}
              title="Toggle ascending/descending"
            >{asc ? "↑" : "↓"}</button>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600">{filtered.length} result(s)</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(p => (
          <button
            key={p.id}
            onClick={() => navigate(`/pokemon/${p.name}`)}
            className="group text-left"
          >
            <Card>
              <div className="flex items-center gap-4">
                <img src={imgFor(p)} alt={p.name} className="h-20 w-20 object-contain drop-shadow" />
                <div>
                  <div className="text-xs text-gray-500">#{p.id.toString().padStart(3, "0")}</div>
                  <div className="text-lg font-semibold capitalize group-hover:underline">{p.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.types.map(t => <Chip key={t.type.name} label={t.type.name} />)}
                  </div>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
};

// -----------------------------
// Gallery View (filter by type)
// -----------------------------
const GalleryView: React.FC<{ data: PokemonDetail[]; allTypes: string[] }> = ({ data, allTypes }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggle = (t: string) => setSelected(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const filtered = useMemo(() => {
    if (selected.length === 0) return data;
    return data.filter(p => selected.every(t => p.types.some(tp => tp.type.name === t)));
  }, [data, selected]);

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-sm font-medium">Filter by type</div>
        <div className="flex flex-wrap gap-2">
          {allTypes.map(t => (
            <button
              key={t}
              onClick={() => toggle(t)}
              className={`rounded-full border px-3 py-1 text-sm capitalize ${selected.includes(t) ? "bg-black text-white" : "bg-white"}`}
            >{t}</button>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">{filtered.length} match(es) for: {selected.join(", ")}</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {filtered.map(p => (
          <button key={p.id} className="group" onClick={() => navigate(`/pokemon/${p.name}`)}>
            <Card>
              <img src={imgFor(p)} alt={p.name} className="mx-auto h-28 w-28 object-contain drop-shadow" />
              <div className="mt-2 text-center">
                <div className="text-xs text-gray-500">#{p.id.toString().padStart(3, "0")}</div>
                <div className="font-semibold capitalize group-hover:underline">{p.name}</div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
};

// -----------------------------
// Detail View
// -----------------------------
const DetailView: React.FC<{ data: PokemonDetail[] | null }> = ({ data }) => {
  const { idOrName } = useParams();
  const navigate = useNavigate();
  const [manual, setManual] = useState<PokemonDetail | null>(null); // when deep-linked before list is ready

  const list = data ?? [];
  const index = useMemo(() => {
    if (!idOrName) return -1;
    const byName = list.findIndex(p => p.name === idOrName);
    if (byName >= 0) return byName;
    const asNum = Number(idOrName);
    if (!Number.isNaN(asNum)) return list.findIndex(p => p.id === asNum);
    return -1;
  }, [list, idOrName]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (index === -1 && idOrName) {
        try {
          const d = await fetchPokemonDetail(idOrName);
          if (!cancelled) setManual(d);
        } catch {
          if (!cancelled) setManual(null);
        }
      } else {
        setManual(null);
      }
    }
    run();
    return () => { cancelled = true };
  }, [index, idOrName]);

  const p = index >= 0 ? list[index] : manual;

  const goPrev = () => { if (index > 0) navigate(`/pokemon/${list[index - 1].name}`); };
  const goNext = () => { if (index >= 0 && index < list.length - 1) navigate(`/pokemon/${list[index + 1].name}`); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, list]);

  if (!p) {
    return <div className="text-center text-gray-600">Loading Pokémon…</div>;
  }

  const stats = p.stats.map(s => ({ name: s.stat.name, value: s.base_stat }));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <button className="rounded-xl border px-3 py-2 disabled:opacity-40" onClick={goPrev} disabled={index <= 0}>← Prev</button>
        <div className="text-sm text-gray-500">Use ← → keys</div>
        <button className="rounded-xl border px-3 py-2 disabled:opacity-40" onClick={goNext} disabled={index === -1 || index >= list.length - 1}>Next →</button>
      </div>

      <Card>
        <div className="grid gap-6 p-2 sm:grid-cols-2">
          <div className="flex flex-col items-center justify-center">
            <img src={imgFor(p)} alt={p.name} className="h-64 w-64 object-contain drop-shadow" />
          </div>
          <div>
            <div className="text-xs text-gray-500">#{p.id.toString().padStart(3, "0")}</div>
            <h1 className="mb-2 text-3xl font-bold capitalize">{p.name}</h1>
            <div className="mb-3 flex flex-wrap gap-2">
              {p.types.map(t => <Chip key={t.type.name} label={t.type.name} />)}
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-gray-500">Height</dt><dd>{p.height}</dd>
              <dt className="text-gray-500">Weight</dt><dd>{p.weight}</dd>
              <dt className="text-gray-500">Base XP</dt><dd>{p.base_experience}</dd>
              <dt className="text-gray-500">Abilities</dt>
              <dd className="col-span-1">
                <div className="flex flex-wrap gap-1">
                  {p.abilities.map(a => <Chip key={a.ability.name} label={a.ability.name} />)}
                </div>
              </dd>
            </dl>
            <div className="mt-4">
              <div className="mb-1 text-sm font-medium">Stats</div>
              <ul className="space-y-1">
                {stats.map(s => (
                  <li key={s.name} className="flex items-center gap-2 text-sm capitalize">
                    <span className="w-28 text-gray-600">{s.name}</span>
                    <div className="h-2 flex-1 rounded bg-gray-200">
                      <div className="h-2 rounded bg-black" style={{ width: `${Math.min(100, (s.value / 160) * 100)}%` }} />
                    </div>
                    <span className="w-10 text-right">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// -----------------------------
// Layout / App
// -----------------------------
const HomeShell: React.FC = () => {
  const { list, loading, error, progress, allTypes } = usePokemonData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <Link to="/" className="font-mono text-xl font-bold">PokéExplorer</Link>
        <nav className="flex gap-2 rounded-xl border bg-white/60 p-1">
          <NavLink to="/" end className={({ isActive }) => `rounded-lg px-3 py-1.5 text-sm ${isActive ? "bg-black text-white" : "hover:bg-black/5"}`}>List</NavLink>
          <NavLink to="/gallery" className={({ isActive }) => `rounded-lg px-3 py-1.5 text-sm ${isActive ? "bg-black text-white" : "hover:bg-black/5"}`}>Gallery</NavLink>
        </nav>
      </header>

      {loading && (
        <Card>
          <div className="flex items-center justify-between">
            <div>Loading Pokémon… This preloads {POKEMON_LIMIT} entries for smooth sorting & filtering.</div>
            <div className="text-sm text-gray-600">{progress.done}/{progress.total}</div>
          </div>
          <div className="mt-2 h-2 w-full rounded bg-gray-200">
            <div className="h-2 rounded bg-black" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
          </div>
        </Card>
      )}

      {error && (
        <div className="mb-4 rounded-xl border bg-yellow-50 p-3 text-sm text-yellow-800">{error}</div>
      )}

      {list && (
        <Routes>
          <Route index element={<ListView data={list} />} />
          <Route path="gallery" element={<GalleryView data={list} allTypes={allTypes} />} />
          <Route path="pokemon/:idOrName" element={<DetailView data={list} />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      )}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-900">
        <HomeShell />
        <footer className="mt-12 border-t py-6 text-center text-xs text-gray-500">
          Data: <a href="https://pokeapi.co/" className="underline" target="_blank" rel="noreferrer">PokeAPI</a> • Built with React + TS + Axios + React Router
        </footer>
      </div>
    </BrowserRouter>
  );
}
