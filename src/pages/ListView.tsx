import { useEffect, useMemo, useState } from 'react';
import PokemonCard from '../components/PokemonCard';
import Pagination from '../components/Pagination';
import { PokeApi } from '../services/pokeApi';
import type { Pokemon } from '../types/pokemon';
import { useSelection } from '../context/SelectionContext';


const PAGE_SIZE = 24;


export default function ListView() {
const [query, setQuery] = useState('');
const [sortKey, setSortKey] = useState<'name'|'base_experience'|'height'|'weight'>('name');
const [order, setOrder] = useState<'asc'|'desc'>('asc');
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [all, setAll] = useState<Pokemon[]>([]);
const [page, setPage] = useState(1);
const { setOrder: setGlobalOrder } = useSelection();


useEffect(() => {
let alive = true;
(async () => {
try {
setLoading(true); setError(null);
const list = await PokeApi.getPokemonList(200, 0);
const details = await PokeApi.getManyPokemonByNamesOrUrls(list.results);
if (!alive) return;
setAll(details);
} catch (e: any) {
setError(e?.message ?? 'Failed to load');
} finally {
setLoading(false);
}
})();
return () => { alive = false; };
}, []);


const filtered = useMemo(() => {
let res = all;
if (query.trim()) res = res.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
res = [...res].sort((a, b) => {
const av = (a as any)[sortKey];
const bv = (b as any)[sortKey];
if (typeof av === 'string' && typeof bv === 'string') return order === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
return order === 'asc' ? av - bv : bv - av;
});
return res;
}, [all, query, sortKey, order]);


const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
const pageItems = useMemo(() => filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE), [filtered, page]);


useEffect(() => { setPage(1); }, [query, sortKey, order]);
useEffect(() => { setGlobalOrder(filtered.map(p => p.name)); }, [filtered]);


return (
<section>
<h1>List View</h1>
<div className="toolbar">
<SearchBar value={query} onChange={setQuery} />
<SortControls sortKey={sortKey} order={order} onSortKey={setSortKey} onOrder={setOrder} />
</div>


{loading && <div className="card">Loading…</div>}
{error && <div className="card">Error: {error}</div>}


<div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
{pageItems.map(p => <PokemonCard key={p.id} p={p} />)}
</div>


<Pagination page={page} total={totalPages} onPage={setPage} />
</section>
);
}
