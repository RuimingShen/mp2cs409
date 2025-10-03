import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import SearchPage from "./pages/Search";
import GalleryPage from "./pages/Gallery";
import DetailPage from "./pages/Detail";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="shell">
        <nav className="topnav">
          <NavLink to="/" end>Search</NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/pokemon/:idOrName" element={<DetailPage />} />
          </Routes>
        </main>
        <footer className="footer">Made with React + TS + Axios + Router • Pokémon API</footer>
      </div>
    </BrowserRouter>
  );
}
