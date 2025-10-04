// src/pages/Gallery.tsx
import React from "react";
import { Link } from "react-router-dom";
import { getAllTypes, getPokemonByType, getPokemonList } from "../api/pokeapi";
import type { PokemonListItem } from "../types";
import TypeFilter from "../components/TypeFilter";

export default function GalleryPage() {
  const [allTypes, setAllTypes] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [items, setItems] = React.useState<PokemonListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const t = await getAllTypes();
      setAllTypes(t);
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (selected.length === 0) {
          // 默认：展示前 60 个
          setItems(await getPokemonList(60, 0));
          return;
        }

        // 拉取每个类型的列表
        const lists = await Promise.all(selected.map((t) => getPokemonByType(t, 300)));

        if (selected.length === 1) {
          setItems(lists[0]);
          return;
        }

        // —— 这里改为【交集 AND】逻辑 ——
        // 1) 转成 id 的集合
        const idSets = lists.map((lst) => new Set(lst.map((p) => p.id)));

        // 2) 计算交集（出现在每个集合中的 id）
        let intersect = idSets[0];
        for (let i = 1; i < idSets.length; i++) {
          intersect = new Set([...intersect].filter((id) => idSets[i].has(id)));
        }

        // 3) 用第一个出现的条目作为详情来源，映射交集 id → item
        const baseMap = new Map<number, PokemonListItem>();
        lists.forEach((lst) => lst.forEach((p) => { if (!baseMap.has(p.id)) baseMap.set(p.id, p); }));

        const result = [...intersect]
          .map((id) => baseMap.get(id)!)
          .filter(Boolean)
          .slice(0, 120) // 可按需限制数量
          // 可选排序，让展示稳定些
          .sort((a, b) => a.id - b.id);

        setItems(result);
      } catch (e) {
        setError("Failed to load gallery");
      } finally {
        setLoading(false);
      }
    })();
  }, [selected]);

  const toggle = (t: string) =>
    setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  const noResult = !loading && !error && selected.length > 0 && items.length === 0;

  return (
    <div className="page">
      <h1>Gallery</h1>
      <p>Select one or more types to filter (AND).</p>

      <TypeFilter
        allTypes={allTypes}
        selected={selected}
        onToggle={toggle}
        onClear={() => setSelected([])}
      />

      {loading && <p>Loading…</p>}
      {error && <p role="alert">{error}</p>}
      {noResult && <p>No Pokémon match all selected types.</p>}

      <div className="grid">
        {items.map((p) => (
          <Link key={p.id} to={`/pokemon/${p.id}`} className="card" aria-label={`View ${p.name}`}>
            <img src={p.image} alt={p.name} />
            <div className="meta">
              <strong>#{p.id}</strong>
              <span className="cap">{p.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
