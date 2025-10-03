import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ListView from './pages/ListView';
import GalleryView from './pages/GalleryView';
import DetailView from './pages/DetailView';
import { SelectionProvider } from './context/SelectionContext';


export default function App() {
return (
<SelectionProvider>
<Header />
<main className="container">
<Routes>
<Route path="/" element={<Navigate to="/list" replace />} />
<Route path="/list" element={<ListView />} />
<Route path="/gallery" element={<GalleryView />} />
<Route path="/pokemon/:idOrName" element={<DetailView />} />
<Route path="*" element={<Navigate to="/list" replace />} />
</Routes>
</main>
</SelectionProvider>
);
}
