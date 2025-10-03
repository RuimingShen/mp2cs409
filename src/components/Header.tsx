import { NavLink } from 'react-router-dom';


export default function Header() {
return (
<header className="card" style={{ borderRadius: 0 }}>
<div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
<strong>Pokédex • React + TS</strong>
<nav className="row" style={{ gap: '1rem' }}>
<NavLink to="/list">List</NavLink>
<NavLink to="/gallery">Gallery</NavLink>
</nav>
</div>
</header>
);
}
