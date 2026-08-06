import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { urls } from "../constants/urls";
import Seo from "./Seo";
import "../css/MovieList.css";
import "../css/Movie.css";

const FALLBACK_GENRES = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
    { id: 10770, name: "TV Movie" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" },
];

const GENRES_CACHE_KEY = "moviehub-genres-cache";
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

function MovieList() {
    const [genres, setGenres] = useState([]);
    const [genreMap, setGenreMap] = useState({});
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [movies, setMovies] = useState([]);
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
                const response = await fetch(urls.movieGenre);
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
        async function loadMovies() {
            setLoading(true);
            setMovies([]);
            setTotalPages(1);
            setPage(1);
            try {
                const params = new URLSearchParams();
                if (selectedGenre) params.set("genre", String(selectedGenre));

                const query = params.toString();
                const response = await fetch(query ? `${urls.allMovieList}?${query}` : urls.allMovieList);
                if (!response.ok) throw new Error("Could not fetch movies");

                const data = await response.json();
                setMovies(data.results || []);
                setTotalPages(data.total_pages || 1);
            } catch (error) {
                console.error("Failed to load movies", error);
                setMovies([]);
            } finally {
                setLoading(false);
            }
        }

        loadMovies();
    }, [selectedGenre]);

    const loadMore = useCallback(async () => {
        if (loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        try {
            const next = page + 1;
            const params = new URLSearchParams({ page: String(next) });
            if (selectedGenre) params.set("genre", String(selectedGenre));

            const response = await fetch(`${urls.allMovieList}?${params.toString()}`);
            if (!response.ok) throw new Error("Could not fetch movies");

            const data = await response.json();
            setMovies((prev) => [...prev, ...(data.results || [])]);
            setTotalPages(data.total_pages || 1);
            setPage(next);
        } catch (error) {
            console.error("Failed to load more movies", error);
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
                title="Free Movies — Watch Movies Online in HD | Rich TV"
                description="Browse and watch free movies online in HD on Rich TV. Stream action, comedy, drama, horror and more — new releases and all-time favorites, no subscription needed."
                path="/movies"
                keywords="free movies, watch movies online, free movie streaming, Rich TV movies, watch full movies free"
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

                <div className="genre-tabs" ref={genreScrollRef} role="tablist" aria-label="Movie genres">
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
                <p>Loading Movies...</p>
            ) : (
                <>
                    <div className="movie-grid">
                        {movies.map((movie) => (
                            <Link className="movie-card" key={movie.id} to={`/movie/${movie.id}`}>
                                <div className="poster">
                                    <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />

                                    <span className="rating">★ {movie.vote_average}</span>
                                </div>

                                <div className="info">
                                    <h3>{movie.title}</h3>

                                    <div className="genres">
                                        {movie.genre_ids
                                            .map((id) => genreMap[id])
                                            .filter(Boolean)
                                            .map((genre) => (
                                                <span key={genre}>{genre}</span>
                                            ))}
                                    </div>

                                    <p>{movie.overview}</p>

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
                        {loadingMore ? <p>Loading more movies...</p> : null}
                    </div>
                </>
            )}
        </section>
    );
}

export default MovieList;
