interface Props {
sortKey: 'name' | 'base_experience' | 'height' | 'weight';
order: 'asc' | 'desc';
onSortKey: (k: Props['sortKey']) => void;
onOrder: (o: Props['order']) => void;
}


export default function SortControls({ sortKey, order, onSortKey, onOrder }: Props) {
return (
<div className="row">
<select className="select" value={sortKey} onChange={(e) => onSortKey(e.target.value as Props['sortKey'])}>
<option value="name">Name</option>
<option value="base_experience">Base XP</option>
<option value="height">Height</option>
<option value="weight">Weight</option>
</select>
<select className="select" value={order} onChange={(e) => onOrder(e.target.value as Props['order'])}>
<option value="asc">Asc</option>
<option value="desc">Desc</option>
</select>
</div>
);
}
