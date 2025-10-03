// src/types/pokemon.ts

/**
 * Minimal set of PokeAPI types used by the app,
 * kept in one place so api/pages/components can import consistently.
 * You can extend these as needed.
 */

export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface PokemonType {
  slot: number;
  type: NamedAPIResource;
}

export interface PokemonAbility {
  ability: NamedAPIResource;
  is_hidden: boolean;
  slot: number;
}

export interface PokemonStat {
  base_stat: number;
  /** Optional effort field from PokeAPI; not always used */
  effort?: number;
  stat: NamedAPIResource;
}

export interface PokemonSprites {
  // Common top-level sprite fields (subset)
  front_default?: string | null;
  front_shiny?: string | null;
  front_female?: string | null;
  front_shiny_female?: string | null;
  back_default?: string | null;
  back_shiny?: string | null;
  back_female?: string | null;
  back_shiny_female?: string | null;

  // We mainly use the official artwork path in the app
  other?: {
    ["official-artwork"]?: {
      front_default?: string | null;
      front_shiny?: string | null;
    };
    dream_world?: {
      front_default?: string | null;
    };
    home?: {
      front_default?: string | null;
      front_shiny?: string | null;
    };
    // In case PokeAPI adds more sprite groups
    [k: string]: { front_default?: string | null; [x: string]: any } | undefined;
  };

  // Allow unknown extra fields to avoid over-strict typing
  [k: string]: unknown;
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

/** Shape of the paginated list endpoint from PokeAPI */
export interface PokemonListPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}
