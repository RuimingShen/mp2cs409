import axios, { AxiosInstance } from "axios";
import type { PokemonDetail, PokemonListItem } from "../types";

// ---- Basic Axios client
const api: AxiosInstance = axios.create({
  baseURL: "https://pokeapi.co/api/v2",
  timeout: 15000,
});

// ---- Super‑light in‑memory cache for GETs
const cache = new Map<string, any>();

api.interceptors.request.use((config) => {
  if (config.method === "get") {
    const key = config.baseURL + config.url;
    if (key && cache.has(key)) {
      // Return cached response via adapter short‑circuit
      return {
        ...config,
        adapter: async () => ({
          data: cache.get(key),
          status: 200,
          statusText: "OK (cache)",
          headers: {},
          config,
          request: {},
        }),
      } as any;
    }
  }
  return config;
});

api.interceptors.response.use((resp) => {
  if (resp.config.method === "get") {
    const key = resp.config.baseURL + resp.config.url;
    cache.set(key!, resp.data);
  }
  return resp;
});

// ---- Helpers
export const officialArtwork = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const idFromUrl = (url: string) => {
  const m = url.match(/\/pokemon\/(\d+)\/?$/);
  return m ? Number(m[1]) : NaN;
};

// ---- API: list
export async function getPokemonList(limit = 200, offset = 0): Promise<PokemonListItem[]> {
  try {
    const { data } = await api.get(`/pokemon?limit=${limit}&offset=${offset}`);
    return data.results.map((r: { name: string; url: string }) => {
      const id = idFromUrl(r.url);
      return { name: r.name, id, image: officialArtwork(id) } as PokemonListItem;
    });
  } catch (err) {
    // Mock fallback (first 12)
    const mock: PokemonListItem[] = [
      { id: 1, name: "bulbasaur", image: officialArtwork(1) },
      { id: 2, name: "ivysaur", image: officialArtwork(2) },
      { id: 3, name: "venusaur", image: officialArtwork(3) },
      { id: 4, name: "charmander", image: officialArtwork(4) },
      { id: 5, name: "charmeleon", image: officialArtwork(5) },
      { id: 6, name: "charizard", image: officialArtwork(6) },
      { id: 7, name: "squirtle", image: officialArtwork(7) },
      { id: 8, name: "wartortle", image: officialArtwork(8) },
      { id: 9, name: "blastoise", image: officialArtwork(9) },
      { id: 25, name: "pikachu", image: officialArtwork(25) },
      { id: 39, name: "jigglypuff", image: officialArtwork(39) },
      { id: 94, name: "gengar", image: officialArtwork(94) },
    ];
    return mock.slice(0, limit);
  }
}

// ---- API: detail
export async function getPokemonDetail(idOrName: string | number): Promise<PokemonDetail> {
  try {
    const { data } = await api.get(`/pokemon/${idOrName}`);
    return data as PokemonDetail;
  } catch (err) {
    // Minimal mock for Pikachu
    return {
      id: 25,
      name: "pikachu",
      height: 4,
      weight: 60,
      types: [{ slot: 1, type: { name: "electric", url: "" } }],
      abilities: [
        { ability: { name: "static", url: "" }, is_hidden: false, slot: 1 },
        { ability: { name: "lightning-rod", url: "" }, is_hidden: true, slot: 3 },
      ],
      stats: [
        { base_stat: 35, effort: 0, stat: { name: "hp", url: "" } },
        { base_stat: 55, effort: 0, stat: { name: "attack", url: "" } },
        { base_stat: 40, effort: 0, stat: { name: "defense", url: "" } },
        { base_stat: 50, effort: 0, stat: { name: "special-attack", url: "" } },
        { base_stat: 50, effort: 0, stat: { name: "special-defense", url: "" } },
        { base_stat: 90, effort: 2, stat: { name: "speed", url: "" } },
      ],
      sprites: { other: { ["official-artwork"]: { front_default: officialArtwork(25) } } },
    };
  }
}

// ---- API: types
export async function getAllTypes(): Promise<string[]> {
  try {
    const { data } = await api.get("/type");
    // filter only actual types (1..20) and map names
    return data.results
      .map((t: { name: string; url: string }) => t.name)
      .filter((n: string) => !["unknown", "shadow"].includes(n));
  } catch (err) {
    return ["grass", "fire", "water", "electric", "ghost", "fairy"];
  }
}

export async function getPokemonByType(type: string, cap = 80): Promise<PokemonListItem[]> {
  try {
    const { data } = await api.get(`/type/${type}`);
    const list: PokemonListItem[] = (data.pokemon as { pokemon: { name: string; url: string } }[])
      .slice(0, cap)
      .map(({ pokemon }: any) => {
        const id = idFromUrl(pokemon.url.replace("pokemon/", "pokemon/"));
        return { id, name: pokemon.name, image: officialArtwork(id) } as PokemonListItem;
      });
    return list;
  } catch (err) {
    // mock empty on failure
    return [];
  }
}
