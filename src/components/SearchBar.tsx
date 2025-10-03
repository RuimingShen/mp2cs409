import { useEffect, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';


interface Props { value: string; onChange: (v: string) => void; placeholder?: string }


export default function SearchBar({ value, onChange, placeholder = 'Search by name…' }: Props) {
const [input, setInput] = useState(value);
const debounced = useDebounce(input, 200);


useEffect(() => { onChange(debounced); }, [debounced]);
useEffect(() => { setInput(value); }, [value]);


return (
<input
className="input"
value={input}
onChange={(e) => setInput(e.target.value)}
placeholder={placeholder}
aria-label="Search"
/>
);
}
