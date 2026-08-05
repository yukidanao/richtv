import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Search, X } from "lucide-react";
import { urls } from "../constants/urls";
import "../css/Search.css";
import "../css/Movie.css";

const SEARCH_TYPES = [
    { value: "all", label: "All" },
    { value: "movie", label: "Movies" },
    { value: "tv", label: "TV Shows" },
];

function normalizeResults(results, mediaType) {
    return (results || []).map((item) => ({ ...item, mediaType }));
}

function SearchModal({ open, onClose }) {
    const [query, setQuery] = useState("");
    const [searchType, setSearchType] = useState("all");
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
            const q = encodeURIComponent(query.trim());
            try {
                const requests = [];

                if (searchType === "all" || searchType === "movie") {
                    requests.push(
                        fetch(`${urls.searchMovie}?input=${q}`)
                            .then((r) => (r.ok ? r.json() : { results: [] }))
                            .then((data) => normalizeResults(data.results, "movie"))
                    );
                }

                if (searchType === "all" || searchType === "tv") {
                    requests.push(
                        fetch(`${urls.searchTV}?input=${q}`)
                            .then((r) => (r.ok ? r.json() : { results: [] }))
                            .then((data) => normalizeResults(data.results, "tv"))
                    );
                }

                const grouped = await Promise.all(requests);
                setResults(grouped.flat());
            } catch {
                setResults([]);
            } finally {
                setSearched(true);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, searchType, open]);

    function handleInput(e) {
        const value = e.target.value;
        setQuery(value);
        if (!value.trim()) {
            setResults([]);
            setSearched(false);
        }
    }

    function handleTypeChange(type) {
        setSearchType(type);
        setSearched(false);
        setResults([]);
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

    const placeholder = {
        all: "Search movies & TV shows…",
        movie: "Search movies…",
        tv: "Search TV shows…",
    }[searchType];

    let content;
    if (!query.trim()) {
        content = <p className="search-empty">Type to search…</p>;
    } else if (!searched) {
        content = <p className="search-empty">Searching…</p>;
    } else if (results.length === 0) {
        content = <p className="search-empty">No results for “{query}”</p>;
    } else {
        content = (
            <div className="movie-grid">
                {results.map((result) => {
                    const isTv = result.mediaType === "tv";
                    const title = isTv ? result.name || result.original_name : result.title;
                    const year = (isTv ? result.first_air_date : result.release_date)?.slice(0, 4) || "";

                    return (
                        <div
                            className="movie-card"
                            key={`${result.mediaType}-${result.id}`}
                            onClick={() => {
                                onClose();
                                navigate(isTv ? `/tv/${result.id}` : `/movie/${result.id}`);
                            }}
                        >
                            <div className="poster">
                                <img src={`https://image.tmdb.org/t/p/w500${result.poster_path}`} alt={title} />

                                <span className="rating">★ {result.vote_average}</span>
                            </div>

                            <div className="info">
                                <h3>{title}</h3>

                                <div className="meta">
                                    <span>{year}</span>
                                    <span className="search-type-badge">{isTv ? "TV" : "Movie"}</span>
                                </div>

                                <p>{result.overview}</p>
                            </div>
                        </div>
                    );
                })}
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
            <div className="search-modal" role="dialog" aria-modal="true" aria-label="Search">
                <div className="search-input-row">
                    <Search size={20} className="search-input-icon" />

                    <input
                        ref={inputRef}
                        className="search-input"
                        type="text"
                        placeholder={placeholder}
                        value={query}
                        onChange={handleInput}
                    />

                    <button className="search-close" type="button" aria-label="Close search" onClick={onClose}>
                        <X size={22} />
                    </button>
                </div>

                <div className="search-type-row" role="tablist" aria-label="Search scope">
                    {SEARCH_TYPES.map(({ value, label }) => (
                        <button
                            key={value}
                            className={`search-type-tab${searchType === value ? " search-type-tab--active" : ""}`}
                            type="button"
                            role="tab"
                            aria-selected={searchType === value}
                            onClick={() => handleTypeChange(value)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="search-results">{content}</div>
            </div>
        </div>
    );
}

export default SearchModal;
