export interface NamedAPIResource { name: string; url: string; }
export interface PokemonListResponse { count: number; next: string | null; previous: string | null; results: NamedAPIResource[]; }


export interface PokemonType { slot: number; type: NamedAPIResource; }
export interface PokemonAbility { ability: NamedAPIResource; is_hidden: boolean; slot: number; }
export interface PokemonStat { base_stat: number; effort: number; stat: NamedAPIResource; }
export interface PokemonSprites {
front_default: string | null; other?: { [key: string]: { front_default?: string | null } };
}


export interface Pokemon {
id: number;
name: string;
height: number;
weight: number;
base_experience: number;
abilities: PokemonAbility[];
sprites: PokemonSprites;
stats: PokemonStat[];
types: PokemonType[];
}
