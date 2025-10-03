import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PokemonDetail } from "@/api/pokemon";
import Card from "@/components/Card";
import Chip from "@/components/Chip";
import SortControl from "@/components/SortControl";
import useDebounced from "@/hooks/useDebounced";

type SortKey = "id" | "name" | "height" | "weight" | "base_experience";

function imgFor(p: PokemonDetail): string | undefined {
  return (
    p.sprites?.other?.["official-artwork"]?.front_default ??
    p.sprites?.front_default ??
    undefined
  );
}

export interface ListViewProps {
  data: PokemonDetail[];
}

export default function ListView({ data }: ListViewProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [asc, setAsc] = useState(true);
  const debounced = useDebounced(query, 0); // filter as you type
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();

    let arr = !q
      ? data
      : data.filter((p) => {
          if (p.name.includes(q)) return true;
          if (String(p.id) === q) return true;
          // optional: match by type
          if (p.types.some((t) => t.type.name.includes(q))) return true;
          return false;
        });

    arr = arr.slice().sort((a, b) => {
      const va = (a as any)[sortKey];
      const vb = (b as any)[sortKey];
      if (va < vb) return asc ? -1 : 1;
      if (va > vb) return asc ? 1 : -1;
      return a.name.localeCompare(b.name) * (asc ? 1 : -1);
    });

    return arr;
  }, [data, debounced, sortKey, asc]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium">Search Pokémon</label>
          <input
            className="mt-1 w-full rounded-xl border p-2"
            placeholder="e.g. pikachu, 25, or water"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <SortControl<SortKey>
          className="sm:ml-2"
          options={[
            { label: "ID", value: "id" },
            { label: "Name", value: "name" },
            { label: "Height", value: "height" },
            { label: "Weight", value: "weight" },
            { label: "Base XP", value: "base_experience" },
          ]}
          value={sortKey}
          asc={asc}
          onChangeValue={(v) => setSortKey(v)}
          onToggleAsc={() => setAsc((a) => !a)}
        />
      </div>

      <p className="text-sm text-gray-600">{filtered.length} result(s)</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/pokemon/${p.name}`)}
            className="group text-left"
          >
            <Card>
              <div className="flex items-center gap-4">
                <img
                  src={imgFor(p)}
                  alt={p.name}
                  className="h-20 w-20 object-contain drop-shadow"
                />
                <div>
                  <div className="text-xs text-gray-500">
                    #{p.id.toString().padStart(3, "0")}
                  </div>
                  <div className="text-lg font-semibold capitalize group-hover:underline">
                    {p.name}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.types.map((t) => (
                      <Chip key={t.type.name} label={t.type.name} asSpan />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
