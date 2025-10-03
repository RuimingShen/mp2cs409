import { useEffect, useMemo, useState } from 'react';
import { PokeApi } from '../services/pokeApi';
import PokemonCard from '../components/PokemonCard';
import TypeFilters from '../components/TypeFilters';
import type { Pokemon } from '../types/pokemon';
import { useSelection } from '../context/SelectionContext';


export default function GalleryView() {
const [all, setAll] = useState<Pokemon[]>([]);
const [types, setTypes] = useState<string[]>([]);
const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(true);
const { setOrder } = useSelection();


useEffect(() => {
let alive = true;
(async () => {
try {
setLoading(true); setError(null);
const list = await PokeApi.getPokemonList(200, 0);
const details = await PokeApi.getManyPokemonByNamesOrUrls(list.results);
if (!alive) return;
setAll(details);
const tset = new Set(details.flatMap(p => p.types.map(t => t.type.name)));
setTypes(Array.from(tset).sort());
} catch (e: any) {
setError(e?.message ?? 'Failed to load');
} finally { setLoading(false); }
})();
return () => { alive = false; };
}, []);


const filtered = useMemo(() => {
if (!selectedTypes.length) return all;
return all.filter(p => {
const pt = p.types.map(t => t.type.name);
return selectedTypes.every(t => pt.includes(t));
});
}, [all, selectedTypes]);


useEffect(() => { setOrder(filtered.map(p => p.name)); }, [filtered]);


return (
<section>
<h1>Gallery View</h1>
<div className="toolbar">
<TypeFilters allTypes={types} selected={selectedTypes} onChange={setSelectedTypes} />
</div>


{loading && <div className="card">Loading…</div>}
{error && <div className="card">Error: {error}</div>}


<div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
{filtered.map(p => <PokemonCard key={p.id} p={p} />)}
</div>
</section>
);
}
