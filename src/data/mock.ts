// src/data/mock.ts
// Tiny mocked dataset so the app still works if PokeAPI hiccups.
// You can use this in tests or as a fallback for demos.

import type { PokemonDetail, NamedAPIResource } from "@/types/pokemon";

export const MOCK_POKEMON: PokemonDetail[] = [
  {
    id: 1,
    name: "bulbasaur",
    height: 7,
    weight: 69,
    base_experience: 64,
    types: [
      { slot: 1, type: { name: "grass", url: "" } },
      { slot: 2, type: { name: "poison", url: "" } },
    ],
    abilities: [
      { ability: { name: "overgrow", url: "" }, is_hidden: false, slot: 1 },
    ],
    stats: [
      { base_stat: 45, stat: { name: "hp", url: "" } as any },
      { base_stat: 49, stat: { name: "attack", url: "" } as any },
      { base_stat: 49, stat: { name: "defense", url: "" } as any },
      { base_stat: 65, stat: { name: "special-attack", url: "" } as any },
      { base_stat: 65, stat: { name: "special-defense", url: "" } as any },
      { base_stat: 45, stat: { name: "speed", url: "" } as any },
    ],
    sprites: {
      other: {
        "official-artwork": {
          front_default:
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
        },
      },
      front_default: null,
    },
  },
  {
    id: 4,
    name: "charmander",
    height: 6,
    weight: 85,
    base_experience: 62,
    types: [{ slot: 1, type: { name: "fire", url: "" } }],
    abilities: [
      { ability: { name: "blaze", url: "" }, is_hidden: false, slot: 1 },
    ],
    stats: [
      { base_stat: 39, stat: { name: "hp", url: "" } as any },
      { base_stat: 52, stat: { name: "attack", url: "" } as any },
      { base_stat: 43, stat: { name: "defense", url: "" } as any },
      { base_stat: 60, stat: { name: "special-attack", url: "" } as any },
      { base_stat: 50, stat: { name: "special-defense", url: "" } as any },
      { base_stat: 65, stat: { name: "speed", url: "" } as any },
    ],
    sprites: {
      other: {
        "official-artwork": {
          front_default:
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
        },
      },
      front_default: null,
    },
  },
  {
    id: 7,
    name: "squirtle",
    height: 5,
    weight: 90,
    base_experience: 63,
    types: [{ slot: 1, type: { name: "water", url: "" } }],
    abilities: [
      { ability: { name: "torrent", url: "" }, is_hidden: false, slot: 1 },
    ],
    stats: [
      { base_stat: 44, stat: { name: "hp", url: "" } as any },
      { base_stat: 48, stat: { name: "attack", url: "" } as any },
      { base_stat: 65, stat: { name: "defense", url: "" } as any },
      { base_stat: 50, stat: { name: "special-attack", url: "" } as any },
      { base_stat: 64, stat: { name: "special-defense", url: "" } as any },
      { base_stat: 43, stat: { name: "speed", url: "" } as any },
    ],
    sprites: {
      other: {
        "official-artwork": {
          front_default:
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
        },
      },
      front_default: null,
    },
  },
];

/** Mock list in the same shape as PokeAPI’s list endpoint `results`. */
export const MOCK_LIST: NamedAPIResource[] = MOCK_POKEMON.map((p) => ({
  name: p.name,
  url: `https://pokeapi.co/api/v2/pokemon/${p.id}/`,
}));

/** Convenience helper to fetch a single mocked Pokémon by id or name. */
export function getMockPokemon(idOrName: number | string): PokemonDetail | null {
  const key = String(idOrName).toLowerCase();
  const asNum = Number(idOrName);
  return (
    MOCK_POKEMON.find((m) => m.name === key) ??
    (!Number.isNaN(asNum) ? MOCK_POKEMON.find((m) => m.id === asNum) : undefined) ??
    null
  );
}
