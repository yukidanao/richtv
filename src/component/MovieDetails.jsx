import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Play, Info, ChevronLeft } from "lucide-react";
import { urls } from "../constants/urls";
import Player from "./Player";
import "../css/MovieDetails.css";
import "../css/Movie.css";

function MovieDetails() {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [logo, setLogo] = useState(null);
    const [cast, setCast] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [trailer, setTrailer] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function loadAll() {
            setLoading(true);
            try {
                const [detailsRes, logoRes, castRes, recoRes, trailerRes] = await Promise.all([
                    fetch(`${urls.movieDetails}/${movieId}`),
                    fetch(`${urls.movieLogo}/${movieId}`),
                    fetch(`${urls.movieCast}/${movieId}`),
                    fetch(`${urls.movieRecommendation}/${movieId}`),
                    fetch(`${urls.movieTrailer}/${movieId}`),
                ]);

                if (!detailsRes.ok) throw new Error("Could not fetch movie details");

                const details = await detailsRes.json();
                const logoData = logoRes.ok ? await logoRes.json() : null;
                const castData = castRes.ok ? await castRes.json() : null;
                const recoData = recoRes.ok ? await recoRes.json() : null;
                const trailerData = trailerRes.ok ? await trailerRes.json() : null;

                if (!active) return;

                const videos = Array.isArray(trailerData) ? trailerData : [];
                const officialTrailer = videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official);
                const anyTrailer = videos.find((v) => v.site === "YouTube" && v.type === "Trailer");

                setMovie(details);
                setLogo(logoData?.file_path ? logoData : null);
                setCast(Array.isArray(castData) ? castData : []);
                setRecommendations(Array.isArray(recoData?.results) ? recoData.results : []);
                setTrailer((officialTrailer || anyTrailer)?.key || null);
            } catch (error) {
                console.error("Failed to load movie details", error);
                if (active) setMovie(null);
            } finally {
                if (active) setLoading(false);
            }
        }

        loadAll();
        return () => {
            active = false;
        };
    }, [movieId]);

    if (loading) {
        return (
            <div className="movie-details">
                <p className="movie-details-loading">Loading details…</p>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="movie-details">
                <p className="movie-details-loading">Could not load this movie.</p>
                <Link className="movie-details-back" to="/">← Back to home</Link>
            </div>
        );
    }

    const year = movie.release_date ? movie.release_date.slice(0, 4) : "";
    const runtime = movie.runtime ? `${movie.runtime} min` : "";
    const backdrop = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
    const logoUrl = logo ? `https://image.tmdb.org/t/p/w500${logo.file_path}` : null;

    return (
        <div className="movie-details">
            <section className="movie-details-hero">
                {!playing && trailer ? (
                    <iframe
                        className="movie-details-trailer"
                        src={`https://www.youtube.com/embed/${trailer}?autoplay=1&controls=0&disablekb=1&loop=1&playlist=${trailer}&rel=0&modestbranding=1&playsinline=1`}
                        title={`${movie.title} trailer`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                ) : (
                    <img className="movie-details-backdrop" src={backdrop} alt="" />
                )}

                <div className="movie-details-scrim movie-details-scrim--left" />
                <div className="movie-details-scrim movie-details-scrim--bottom" />
                <div className="movie-details-scrim movie-details-scrim--top" />

                <Link className="movie-details-back" to="/" aria-label="Go back">
                    <ChevronLeft size={22} />
                    Back
                </Link>

                <div className="movie-details-content">
                    <div className="movie-details-panel">
                        {logoUrl ? (
                            <img className="movie-details-logo" src={logoUrl} alt={movie.title} />
                        ) : (
                            <h1 className="movie-details-title">{movie.title}</h1>
                        )}

                        <div className="movie-details-meta">
                            <span className="movie-details-rating">★ {movie.vote_average?.toFixed(1)}</span>
                            {year && <span>{year}</span>}
                            {runtime && <span>{runtime}</span>}
                            {movie.adult && <span className="movie-details-badge">18+</span>}
                            <span className="movie-details-sep" />
                            <span className="movie-details-genres">
                                {movie.genres?.map((genre) => <span key={genre.id}>{genre.name}</span>)}
                            </span>
                        </div>

                        {movie.tagline && <p className="movie-details-tagline">“{movie.tagline}”</p>}

                        <p className="movie-details-desc">{movie.overview}</p>

                        <div className="movie-details-actions">
                            <button className="movie-details-btn movie-details-btn--play" type="button" onClick={() => setPlaying(true)}>
                                <Play size={20} fill="#141414" />
                                Play
                            </button>
                            <button className="movie-details-btn movie-details-btn--info" type="button">
                                <Info size={20} />
                                More Info
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {cast.length > 0 && (
                <section className="movie-details-cast">
                    <h2 className="movie-details-section-title">Cast</h2>
                    <div className="movie-details-cast-grid">
                        {cast.map((person) => (
                            <div className="movie-details-cast-card" key={person.id}>
                                <div className="movie-details-cast-photo">
                                    {person.profile_path ? (
                                        <img src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} alt={person.name} />
                                    ) : (
                                        <span>{person.name.slice(0, 1)}</span>
                                    )}
                                </div>
                                <p className="movie-details-cast-name">{person.name}</p>
                                <p className="movie-details-cast-role">{person.character}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        {recommendations.length > 0 && (
                <section className="movie-details-recommendations">
                    <h2 className="movie-details-section-title">You might also like</h2>
                    <div className="movie-grid">
                        {recommendations.map((item) => (
                            <div className="movie-card" key={item.id} onClick={() => navigate(`/movie/${item.id}`)}>
                                <div className="poster">
                                    <img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} alt={item.title} />

                                    <span className="rating">★ {item.vote_average}</span>
                                </div>

                                <div className="info">
                                    <h3>{item.title}</h3>
                                    <p>{item.overview}</p>

                                    <div className="actions">
                                        <button className="play">▶</button>
                                        <button>+</button>
                                        <button>❤</button>
                                        <button>i</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {playing && <Player movieId={movieId} onClose={() => setPlaying(false)} />}
        </div>
    );
}

export default MovieDetails;