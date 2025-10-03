interface Props {
allTypes: string[];
selected: string[];
onChange: (next: string[]) => void;
}


export default function TypeFilters({ allTypes, selected, onChange }: Props) {
function toggle(type: string) {
const next = selected.includes(type) ? selected.filter(t => t !== type) : [...selected, type];
onChange(next);
}


return (
<div className="row" role="group" aria-label="Type filters">
{allTypes.map(t => (
<label key={t} className="badge" style={{ cursor: 'pointer' }}>
<input
type="checkbox"
checked={selected.includes(t)}
onChange={() => toggle(t)}
style={{ marginRight: 6 }}
/>
{t}
</label>
))}
</div>
);
}
