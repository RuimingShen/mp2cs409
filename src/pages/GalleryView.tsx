import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PokemonDetail } from "@/api/pokemon";
import Card from "@/components/Card";
import Chip from "@/components/Chip";

function imgFor(p: PokemonDetail): string | undefined {
  return (
    p.sprites?.other?.["official-artwork"]?.front_default ??
    p.sprites?.front_default ??
    undefined
  );
}

export interface GalleryViewProps {
  data: PokemonDetail[];
  allTypes: string[];
}

export default function GalleryView({ data, allTypes }: GalleryViewProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggle = (t: string) =>
    setSelected((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const filtered = useMemo(() => {
    if (selected.length === 0) return data;
    return data.filter((p) =>
      selected.every((t) => p.types.some((tp) => tp.type.name === t))
    );
  }, [data, selected]);

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-sm font-medium">Filter by type</div>
        <div className="flex flex-wrap gap-2">
          {allTypes.map((t) => (
            <Chip
              key={t}
              label={t}
              selected={selected.includes(t)}
              onClick={() => toggle(t)}
            />
          ))}
        </div>
        {selected.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {filtered.length} match(es) for: {selected.join(", ")}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {filtered.map((p) => (
          <button
            key={p.id}
            className="group"
            onClick={() => navigate(`/pokemon/${p.name}`)}
          >
            <Card>
              <img
                src={imgFor(p)}
                alt={p.name}
                className="mx-auto h-28 w-28 object-contain drop-shadow"
              />
              <div className="mt-2 text-center">
                <div className="text-xs text-gray-500">
                  #{p.id.toString().padStart(3, "0")}
                </div>
                <div className="font-semibold capitalize group-hover:underline">
                  {p.name}
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
