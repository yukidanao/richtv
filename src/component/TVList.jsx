import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { urls } from "../constants/urls";
import Seo from "./Seo";
import "../css/MovieList.css";
import "../css/Movie.css";

const FALLBACK_GENRES = [
    { id: 10759, name: "Action & Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 10762, name: "Kids" },
    { id: 9648, name: "Mystery" },
    { id: 10763, name: "News" },
    { id: 10764, name: "Reality" },
    { id: 10765, name: "Sci-Fi & Fantasy" },
    { id: 10766, name: "Soap" },
    { id: 10767, name: "Talk" },
    { id: 10768, name: "War & Politics" },
    { id: 37, name: "Western" },
];

const GENRES_CACHE_KEY = "moviehub-tv-genres-cache";
const GENRES_CACHE_TTL = 24 * 60 * 60 * 1000;

function loadGenresFromCache() {
    try {
        const raw = localStorage.getItem(GENRES_CACHE_KEY);
        if (!raw) return null;

        const { cachedAt, genres } = JSON.parse(raw);
        if (!Array.isArray(genres) || genres.length === 0) return null;
        if (Date.now() - cachedAt > GENRES_CACHE_TTL) return null;

        return genres;
    } catch {
        return null;
    }
}

function saveGenresToCache(genres) {
    try {
        localStorage.setItem(GENRES_CACHE_KEY, JSON.stringify({ cachedAt: Date.now(), genres }));
    } catch {
        // ignore write failures (e.g. private mode)
    }
}

function TVList() {
    const [genres, setGenres] = useState([]);
    const [genreMap, setGenreMap] = useState({});
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [tvshows, setTVShows] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [genresLoading, setGenresLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const genreScrollRef = useRef(null);
    const sentinelRef = useRef(null);
    const loadingMoreRef = useRef(false);

    const hasMore = page < totalPages;

    useEffect(() => {
        function applyGenres(fetchedGenres) {
            setGenres(fetchedGenres);
            setGenreMap(
                fetchedGenres.reduce((acc, genre) => {
                    acc[genre.id] = genre.name;
                    return acc;
                }, {})
            );
        }

        async function loadGenres() {
            const cached = loadGenresFromCache();
            if (cached) {
                applyGenres(cached);
                setGenresLoading(false);
                return;
            }

            try {
                const response = await fetch(urls.tvGenre);
                if (!response.ok) throw new Error("Could not fetch genres");

                const data = await response.json();
                const fetchedGenres = Array.isArray(data?.genres) && data.genres.length > 0
                    ? data.genres
                    : FALLBACK_GENRES;

                applyGenres(fetchedGenres);
                saveGenresToCache(fetchedGenres);
            } catch (error) {
                console.error("Failed to load genres", error);
                applyGenres(FALLBACK_GENRES);
            } finally {
                setGenresLoading(false);
            }
        }

        loadGenres();
    }, []);

    useEffect(() => {
        async function loadTVShows() {
            setLoading(true);
            setTVShows([]);
            setTotalPages(1);
            setPage(1);
            try {
                const params = new URLSearchParams();
                if (selectedGenre) params.set("genres", String(selectedGenre));

                const query = params.toString();
                const response = await fetch(query ? `${urls.allTVList}?${query}` : urls.allTVList);
                if (!response.ok) throw new Error("Could not fetch TV shows");

                const data = await response.json();
                setTVShows(data.results || []);
                setTotalPages(data.total_pages || 1);
            } catch (error) {
                console.error("Failed to load TV shows", error);
                setTVShows([]);
            } finally {
                setLoading(false);
            }
        }

        loadTVShows();
    }, [selectedGenre]);

    const loadMore = useCallback(async () => {
        if (loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        try {
            const next = page + 1;
            const params = new URLSearchParams({ page: String(next) });
            if (selectedGenre) params.set("genres", String(selectedGenre));

            const response = await fetch(`${urls.allTVList}?${params.toString()}`);
            if (!response.ok) throw new Error("Could not fetch TV shows");

            const data = await response.json();
            setTVShows((prev) => [...prev, ...(data.results || [])]);
            setTotalPages(data.total_pages || 1);
            setPage(next);
        } catch (error) {
            console.error("Failed to load more TV shows", error);
        } finally {
            loadingMoreRef.current = false;
            setLoadingMore(false);
        }
    }, [page, selectedGenre]);

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node || !hasMore) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) loadMore();
            },
            { rootMargin: "400px" }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [loadMore, hasMore]);

    function handleGenreSelect(genreId) {
        setSelectedGenre((prev) => (prev === genreId ? null : genreId));
    }

    function scrollGenres(direction) {
        const node = genreScrollRef.current;
        if (!node) return;
        node.scrollBy({ left: direction * node.clientWidth * 0.75, behavior: "smooth" });
    }

    useEffect(() => {
        const node = genreScrollRef.current;
        if (!node) return;

        function updateScrollState() {
            setCanScrollLeft(node.scrollLeft > 4);
            setCanScrollRight(node.scrollLeft + node.clientWidth < node.scrollWidth - 4);
        }

        updateScrollState();
        node.addEventListener("scroll", updateScrollState, { passive: true });
        window.addEventListener("resize", updateScrollState);
        return () => {
            node.removeEventListener("scroll", updateScrollState);
            window.removeEventListener("resize", updateScrollState);
        };
    }, [genresLoading]);

    return (
        <section className="movie-list-page">
            <Seo
                title="Free TV Shows — Watch TV Series Online | Rich TV"
                description="Watch free TV shows and series online on Rich TV. Stream popular dramas, comedies, sci-fi and more — binge full seasons for free, no subscription required."
                path="/tv"
                keywords="free tv shows, watch tv series online, free streaming, Rich TV tv shows, binge series free"
            />
            <div className="genre-scroll">
                <button
                    className="genre-arrow genre-arrow--prev"
                    type="button"
                    aria-label="Scroll genres left"
                    disabled={!canScrollLeft}
                    onClick={() => scrollGenres(-1)}
                >
                    ‹
                </button>

                <div className="genre-tabs" ref={genreScrollRef} role="tablist" aria-label="TV show genres">
                    {genresLoading ? (
                        <span className="genre-tab genre-tab--loading">Loading genres…</span>
                    ) : (
                        genres.map((genre) => (
                            <button
                                key={genre.id}
                                className={`genre-tab${selectedGenre === genre.id ? " genre-tab--active" : ""}`}
                                type="button"
                                role="tab"
                                aria-selected={selectedGenre === genre.id}
                                onClick={() => handleGenreSelect(genre.id)}
                            >
                                {genre.name}
                            </button>
                        ))
                    )}
                </div>

                <button
                    className="genre-arrow genre-arrow--next"
                    type="button"
                    aria-label="Scroll genres right"
                    disabled={!canScrollRight}
                    onClick={() => scrollGenres(1)}
                >
                    ›
                </button>
            </div>

            {loading ? (
                <p>Loading TV Shows...</p>
            ) : (
                <>
                    <div className="movie-grid">
                        {tvshows.map((tvshow) => (
                            <Link className="movie-card" key={tvshow.id} to={`/tv/${tvshow.id}`}>
                                <div className="poster">
                                    <img src={`https://image.tmdb.org/t/p/w500${tvshow.poster_path}`} alt={tvshow.original_name} />

                                    <span className="rating">★ {tvshow.vote_average}</span>
                                </div>

                                <div className="info">
                                    <h3>{tvshow.original_name}</h3>

                                    <div className="genres">
                                        {tvshow.genre_ids
                                            .map((id) => genreMap[id])
                                            .filter(Boolean)
                                            .map((genre) => (
                                                <span key={genre}>{genre}</span>
                                            ))}
                                    </div>

                                    <p>{tvshow.overview}</p>

                                    <div className="actions">
                                        <button className="play">▶</button>
                                        <button>+</button>
                                        <button>❤</button>
                                        <button>i</button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="movie-list-sentinel" ref={sentinelRef}>
                        {loadingMore ? <p>Loading more TV shows...</p> : null}
                    </div>
                </>
            )}
        </section>
    );
}

export default TVList;
