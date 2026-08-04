import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Search, X } from "lucide-react";
import { urls } from "../constants/urls";
import "../css/Search.css";
import "../css/Movie.css";

function SearchModal({ open, onClose }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    useEffect(() => {
        if (!open || !query.trim()) return;

        const timer = setTimeout(async () => {
            try {
                const q = encodeURIComponent(query.trim());
                const response = await fetch(`${urls.searchMovie}?input=${q}`);
                if (!response.ok) throw new Error("Search failed");

                const data = await response.json();
                setResults(data.results || []);
            } catch {
                setResults([]);
            } finally {
                setSearched(true);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, open]);

    function handleInput(e) {
        const value = e.target.value;
        setQuery(value);
        if (!value.trim()) {
            setResults([]);
            setSearched(false);
        }
    }

    useEffect(() => {
        if (!open) return;

        function onKey(e) {
            if (e.key === "Escape") onClose();
        }

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    useEffect(() => {
        if (!open) return;

        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    if (!open) return null;

    let content;
    if (!query.trim()) {
        content = <p className="search-empty">Type to search movies…</p>;
    } else if (!searched) {
        content = <p className="search-empty">Searching…</p>;
    } else if (results.length === 0) {
        content = <p className="search-empty">No results for “{query}”</p>;
    } else {
        content = (
            <div className="movie-grid">
                {results.map((movie) => (
                    <div
                        className="movie-card"
                        key={movie.id}
                        onClick={() => {
                            onClose();
                            navigate(`/movie/${movie.id}`);
                        }}
                    >
                        <div className="poster">
                            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />

                            <span className="rating">★ {movie.vote_average}</span>
                        </div>

                        <div className="info">
                            <h3>{movie.title}</h3>

                            <div className="meta">
                                <span>{movie.release_date ? movie.release_date.slice(0, 4) : ""}</span>
                            </div>

                            <p>{movie.overview}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div
            className="search-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="search-modal" role="dialog" aria-modal="true" aria-label="Search movies">
                <div className="search-input-row">
                    <Search size={20} className="search-input-icon" />

                    <input
                        ref={inputRef}
                        className="search-input"
                        type="text"
                        placeholder="Search movies…"
                        value={query}
                        onChange={handleInput}
                    />

                    <button className="search-close" type="button" aria-label="Close search" onClick={onClose}>
                        <X size={22} />
                    </button>
                </div>

                <div className="search-results">{content}</div>
            </div>
        </div>
    );
}

export default SearchModal;