export interface PokemonListItem {
  name: string;
  id: number;
  image: string; // official artwork URL
}

export interface PokemonTypeRef {
  slot: number;
  type: { name: string; url: string };
}

export interface PokemonAbilityRef {
  ability: { name: string; url: string };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonStatRef {
  base_stat: number;
  effort: number;
  stat: { name: string; url: string };
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonTypeRef[];
  abilities: PokemonAbilityRef[];
  stats: PokemonStatRef[];
  sprites: {
    other?: {
      [k: string]: { front_default?: string } | undefined;
      ["official-artwork"]?: { front_default?: string };
    };
  };
}
