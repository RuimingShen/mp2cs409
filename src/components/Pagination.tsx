interface Props {
page: number; // 1-based
total: number;
onPage: (n: number) => void;
}


export default function Pagination({ page, total, onPage }: Props) {
const canPrev = page > 1;
const canNext = page < total;
return (
<div className="row" style={{ justifyContent: 'center', gap: '1rem', margin: '1rem 0' }}>
<button className="btn" disabled={!canPrev} onClick={() => onPage(page - 1)}>← Prev</button>
<span>Page {page} / {total}</span>
<button className="btn" disabled={!canNext} onClick={() => onPage(page + 1)}>Next →</button>
</div>
);
}
