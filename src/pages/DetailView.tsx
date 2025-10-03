import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { PokemonDetail } from "@/api/pokemon";
import { fetchPokemonDetail } from "@/api/pokemon";
import Card from "@/components/Card";
import Chip from "@/components/Chip";

function imgFor(p: PokemonDetail): string | undefined {
  return (
    p.sprites?.other?.["official-artwork"]?.front_default ??
    p.sprites?.front_default ??
    undefined
  );
}

export interface DetailViewProps {
  /** Full list for indexing & prev/next. Can be null when deep-linked. */
  data: PokemonDetail[] | null;
}

export default function DetailView({ data }: DetailViewProps) {
  const { idOrName } = useParams<{ idOrName: string }>();
  const navigate = useNavigate();
  const [manual, setManual] = useState<PokemonDetail | null>(null); // deep-link fallback

  const list = data ?? [];

  const index = useMemo(() => {
    if (!idOrName) return -1;
    const byName = list.findIndex((p) => p.name === idOrName);
    if (byName >= 0) return byName;
    const asNum = Number(idOrName);
    if (!Number.isNaN(asNum)) return list.findIndex((p) => p.id === asNum);
    return -1;
  }, [list, idOrName]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (index === -1 && idOrName) {
        try {
          const d = await fetchPokemonDetail(idOrName);
          if (!cancelled) setManual(d);
        } catch {
          if (!cancelled) setManual(null);
        }
      } else {
        setManual(null);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [index, idOrName]);

  const p = index >= 0 ? list[index] : manual;

  const goPrev = () => {
    if (index > 0) navigate(`/pokemon/${list[index - 1].name}`);
  };
  const goNext = () => {
    if (index >= 0 && index < list.length - 1)
      navigate(`/pokemon/${list[index + 1].name}`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, list]);

  if (!p) {
    return <div className="text-center text-gray-600">Loading Pokémon…</div>;
  }

  const stats = p.stats.map((s) => ({ name: s.stat.name, value: s.base_stat }));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <button
          className="rounded-xl border px-3 py-2 disabled:opacity-40"
          onClick={goPrev}
          disabled={index <= 0}
        >
          ← Prev
        </button>
        <div className="text-sm text-gray-500">Use ← → keys</div>
        <button
          className="rounded-xl border px-3 py-2 disabled:opacity-40"
          onClick={goNext}
          disabled={index === -1 || index >= list.length - 1}
        >
          Next →
        </button>
      </div>

      <Card>
        <div className="grid gap-6 p-2 sm:grid-cols-2">
          <div className="flex flex-col items-center justify-center">
            <img
              src={imgFor(p)}
              alt={p.name}
              className="h-64 w-64 object-contain drop-shadow"
            />
          </div>
          <div>
            <div className="text-xs text-gray-500">
              #{p.id.toString().padStart(3, "0")}
            </div>
            <h1 className="mb-2 text-3xl font-bold capitalize">{p.name}</h1>
            <div className="mb-3 flex flex-wrap gap-2">
              {p.types.map((t) => (
                <Chip key={t.type.name} label={t.type.name} asSpan />
              ))}
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-gray-500">Height</dt>
              <dd>{p.height}</dd>
              <dt className="text-gray-500">Weight</dt>
              <dd>{p.weight}</dd>
              <dt className="text-gray-500">Base XP</dt>
              <dd>{p.base_experience}</dd>
              <dt className="text-gray-500">Abilities</dt>
              <dd className="col-span-1">
                <div className="flex flex-wrap gap-1">
                  {p.abilities.map((a) => (
                    <Chip key={a.ability.name} label={a.ability.name} asSpan />
                  ))}
                </div>
              </dd>
            </dl>

            <div className="mt-4">
              <div className="mb-1 text-sm font-medium">Stats</div>
              <ul className="space-y-1">
                {stats.map((s) => (
                  <li
                    key={s.name}
                    className="flex items-center gap-2 text-sm capitalize"
                  >
                    <span className="w-28 text-gray-600">{s.name}</span>
                    <div className="h-2 flex-1 rounded bg-gray-200">
                      <div
                        className="h-2 rounded bg-black"
                        style={{
                          width: `${Math.min(100, (s.value / 160) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="w-10 text-right">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
