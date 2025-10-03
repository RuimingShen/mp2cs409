import axios from 'axios';
import type { Pokemon, PokemonListResponse } from '../types/pokemon';
import mock from '../mock/mockPokemon.json';


const api = axios.create({ baseURL: 'https://pokeapi.co/api/v2' });


// In-memory caches to limit rate hits
const listCache = new Map<string, PokemonListResponse>();
const pokemonCache = new Map<string | number, Pokemon>();


async function getPokemonList(limit = 200, offset = 0): Promise<PokemonListResponse> {
const key = `${limit}:${offset}`;
if (listCache.has(key)) return listCache.get(key)!;
try {
const { data } = await api.get<PokemonListResponse>(`/pokemon`, { params: { limit, offset } });
listCache.set(key, data);
return data;
} catch (err) {
// fallback to mock when offline / API down
return { count: (mock as Pokemon[]).length, next: null, previous: null, results: (mock as Pokemon[]).map(p => ({ name: p.name, url: `mock://${p.id}` })) };
}
}


async function getPokemon(idOrName: number | string): Promise<Pokemon> {
if (pokemonCache.has(idOrName)) return pokemonCache.get(idOrName)!;
try {
const { data } = await api.get<Pokemon>(`/pokemon/${idOrName}`);
pokemonCache.set(idOrName, data);
return data;
} catch (err) {
// fallback to mock
const m = (mock as Pokemon[]).find(p => p.id === Number(idOrName) || p.name === idOrName);
if (!m) throw err;
pokemonCache.set(idOrName, m);
return m as Pokemon;
}
}


async function getManyPokemonByNamesOrUrls(items: { name: string; url: string }[]) {
// Batches details; respects cache
return Promise.all(
items.map(async ({ name, url }) => {
const idMatch = url.match(/\/pokemon\/(\d+)/);
const key: string | number = idMatch ? Number(idMatch[1]) : name;
return getPokemon(key);
})
);
}


export const PokeApi = { getPokemonList, getPokemon, getManyPokemonByNamesOrUrls };
