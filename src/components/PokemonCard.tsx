import { Link } from 'react-router-dom';
import type { Pokemon } from '../types/pokemon';


export default function PokemonCard({ p }: { p: Pokemon }) {
const img = p.sprites.other?.["official-artwork"]?.front_default || p.sprites.front_default;
return (
<Link to={`/pokemon/${p.name}`} className="card" style={{ display: 'block' }}>
<div className="row" style={{ justifyContent: 'space-between' }}>
<strong>#{p.id} • {p.name}</strong>
<span className="row" style={{ gap: 6 }}>
{p.types.map(t => <span key={t.type.name} className="badge">{t.type.name}</span>)}
</span>
</div>
{img && (<div style={{ textAlign: 'center', marginTop: 8 }}>
<img className="pixelated" alt={p.name} src={img} width={128} height={128} />
</div>)}
<div className="row" style={{ marginTop: 8 }}>
<span className="badge">HT {p.height}</span>
<span className="badge">WT {p.weight}</span>
<span className="badge">XP {p.base_experience}</span>
</div>
</Link>
);
}
