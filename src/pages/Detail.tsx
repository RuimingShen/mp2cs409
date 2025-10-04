import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPokemonDetail, officialArtwork } from "../api/pokeapi";
import type { PokemonDetail } from "../types";

export default function DetailPage() {
  const params = useParams<{ idOrName: string }>();
  const navigate = useNavigate();
  const idOrName = params.idOrName!;

  const [data, setData] = React.useState<PokemonDetail | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setError(null);
        const d = await getPokemonDetail(idOrName);
        setData(d);
      } catch (e) {
        setError("Failed to load details");
      }
    })();
  }, [idOrName]);

  const go = (delta: number) => {
    if (!data) return;
    const next = Math.max(1, data.id + delta);
    navigate(`/pokemon/${next}`);
  };

  if (error) return <p role="alert">{error}</p>;
  if (!data) return <p>Loading…</p>;

  const art = data.sprites.other?.["official-artwork"]?.front_default || officialArtwork(data.id);

  return (
    <div className="page">
      <div className="detail-wrap">
        <img src={art} alt={data.name} className="art" />
        <div>
          <h1 className="cap">{data.name} <small>#{data.id}</small></h1>
          <p><strong>Types:</strong> {data.types.map((t) => t.type.name).join(", ")}</p>
          <p><strong>Abilities:</strong> {data.abilities.map((a) => a.ability.name).join(", ")}</p>
          <p><strong>Height:</strong> {data.height} | <strong>Weight:</strong> {data.weight}</p>
          <div>
            <strong>Stats:</strong>
            <ul>
              {data.stats.map((s) => (
                <li key={s.stat.name}>
                  {s.stat.name}: {s.base_stat}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12">
            <button onClick={() => go(-1)} aria-label="Previous" className="nav-btn">◀ Prev</button>
            <button onClick={() => go(1)} aria-label="Next" className="nav-btn">Next ▶</button>
          </div>
        </div>
      </div>
    </div>
  );
}
