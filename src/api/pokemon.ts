import { api } from "./client";

/**
 * If you already created separate type files (e.g., src/types/pokemon.ts),
 * you can import from there instead of using these local interfaces.
 */
export interface NamedAPIResource { name: string; url: string }
export interface PokemonType { slot: number; type: NamedAPIResource }
export interface PokemonAbility { ability: NamedAPIResource; is_hidden: boolean; slot: number }
export interface PokemonStat { base_stat: number; stat: { name: string } }
export interface PokemonSprites {
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

/** LocalStorage cache with TTL */
const CACHE_VERSION = "v1";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const TTL = WEEK_MS;

function cacheKey(key: string) {
  return `poke_${CACHE_VERSION}_${key}`;
}

function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(cacheKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.fetchedAt) return null;
    if (Date.now() - parsed.fetchedAt > TTL) return null;
    return parsed.data as T;
  } catch {
    return null;
  }
}

function cacheSet<T>(key: string, data: T) {
  try {
    localStorage.setItem(
      cacheKey(key),
      JSON.stringify({ data, fetchedAt: Date.now() })
    );
  } catch {
    // ignore quota errors
  }
}

/** Tiny inline mock so UI can still work if API blips */
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

function getMock(idOrName: string | number): PokemonDetail | null {
  const name = String(idOrName).toLowerCase();
  const asNum = Number(idOrName);
  return (
    MOCK.find(m => m.name === name) ??
    (!Number.isNaN(asNum) ? MOCK.find(m => m.id === asNum) : undefined) ??
    null
  );
}

/**
 * Fetch the first N Pokémon (names + URLs).
 * Uses cache to reduce rate limiting.
 */
export async function fetchPokemonList(limit = 251): Promise<NamedAPIResource[]> {
  const key = `list_${limit}`;
  const cached = cacheGet<NamedAPIResource[]>(key);
  if (cached) return cached;

  const { data } = await api.get<{ results: NamedAPIResource[] }>(
    `/pokemon?limit=${limit}&offset=0`
  );
  cacheSet(key, data.results);
  return data.results;
}

/**
 * Fetch one Pokémon’s full detail by name or id.
 * Uses cache; returns a small mock if the network fails.
 */
export async function fetchPokemonDetail(idOrName: string | number): Promise<PokemonDetail> {
  const key = `detail_${idOrName}`;
  const cached = cacheGet<PokemonDetail>(key);
  if (cached) return cached;

  try {
    const { data } = await api.get<PokemonDetail>(`/pokemon/${idOrName}`);
    cacheSet(key, data);
    return data;
  } catch (err) {
    const mock = getMock(idOrName);
    if (mock) return mock;
    throw err;
  }
}
