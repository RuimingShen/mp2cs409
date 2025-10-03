import { useEffect, useMemo, useState } from 'react';
(async () => {
try {
setLoading(true); setError(null);
if (!idOrName) throw new Error('Missing id');
const data = await PokeApi.getPokemon(idOrName);
if (!alive) return;
setP(data);
} catch (e: any) {
setError(e?.message ?? 'Failed to load');
} finally { setLoading(false); }
})();
return () => { alive = false; };
}, [idOrName]);


const idx = useMemo(() => p ? order.findIndex(x => x === p.name) : -1, [p, order]);
const prevName = idx > 0 ? order[idx - 1] : null;
const nextName = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;


function goPrev() { if (prevName) navigate(`/pokemon/${prevName}`); else if (p && p.id > 1) navigate(`/pokemon/${p.id - 1}`); }
function goNext() { if (nextName) navigate(`/pokemon/${nextName}`); else if (p) navigate(`/pokemon/${p.id + 1}`); }


if (loading) return <div className="card">Loading…</div>;
if (error) return <div className="card">Error: {error}</div>;
if (!p) return <div className="card">Not found.</div>;


const img = p.sprites.other?.["official-artwork"]?.front_default || p.sprites.front_default;


return (
<section>
<div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
<button className="btn" onClick={() => navigate(-1)}>← Back</button>
<div className="row" style={{ gap: 8 }}>
<button className="btn" onClick={goPrev} disabled={!prevName && p.id <= 1}>◀ Prev</button>
<button className="btn" onClick={goNext}>Next ▶</button>
</div>
</div>


<div className="card">
<div className="row" style={{ justifyContent: 'space-between' }}>
<h2>#{p.id} • {p.name}</h2>
<div className="row" style={{ gap: 6 }}>{p.types.map(t => <span key={t.type.name} className="badge">{t.type.name}</span>)}</div>
</div>
{img && (<div style={{ textAlign: 'center', marginTop: 8 }}>
<img className="pixelated" alt={p.name} src={img} width={256} height={256} />
</div>)}
<div className="row" style={{ gap: 12, marginTop: 12 }}>
<span className="badge">Height: {p.height}</span>
<span className="badge">Weight: {p.weight}</span>
<span className="badge">Base XP: {p.base_experience}</span>
</div>


<h3 style={{ marginTop: 16 }}>Abilities</h3>
<div className="row" style={{ gap: 8 }}>
{p.abilities.map(a => <span key={a.ability.name} className="badge">{a.ability.name}{a.is_hidden ? ' (hidden)' : ''}</span>)}
</div>


<h3 style={{ marginTop: 16 }}>Stats</h3>
<ul>
{p.stats.map(s => (
<li key={s.stat.name}>{s.stat.name}: <strong>{s.base_stat}</strong></li>
))}
</ul>
</div>
</section>
);
}
