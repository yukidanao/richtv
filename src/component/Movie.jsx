import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { urls } from '../constants/urls';
import "../css/Movie.css"

function RevealSection({ children }) {
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const node = ref.current
        if (!node) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.15 }
        )

        observer.observe(node)
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={ref} className={`reveal ${isVisible ? 'is-visible' : ''}`.trim()}>
            {children}
        </div>
    )
}

function Movie() {
    const [movies, setMovies] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadMovies() {
            setLoading(true)
            const response = await fetch(urls.movieUrl);
            const data = await response.json();
            setMovies(data);
            setLoading(false);
        }

        loadMovies();
    }, []);

    useEffect(() => {
        async function loadGenres() {
            const response = await fetch(urls.movieGenre);
            const data = await response.json();
            setGenres(data.genres);

        }

        loadGenres();
    }, []);

    const genreMap = useMemo(() => {
        return genres.reduce((acc, genre) => {
            acc[genre.id] = genre.name;
            return acc;
        }, {});
    }, [genres]);


    if (loading) {
        return (
            <RevealSection>
                <div>
                    <p>Loading Movies...</p>
                </div>
            </RevealSection>
        )
    } else {
        return (
            <RevealSection>
                <>
                    <h1 className="title">Discover Movies</h1>

                    <div className="movie-grid">

                        {movies.map(movie => (
                            <Link className="movie-card" key={movie.id} to={`/movie/${movie.id}`}>

                            <div className="poster">

                                <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} />

                                <span className="rating">★ {movie.vote_average}</span>

                            </div>

                            <div className="info">

                                <h3>{movie.title}</h3>

                                {/* <div className="meta">
                                    <span>2014</span>
                                    <span>169 min</span>
                                    <span>PG-13</span>
                                </div> */}


                                <div className="genres">
                                    {movie.genre_ids
                                        .map(id => genreMap[id])
                                        .filter(Boolean)
                                        .map(genre => (
                                            <span key={genre}>{genre}</span>
                                        ))}
                                </div>

                                <p>
                                    {movie.overview}
                                </p>

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
                </>
            </RevealSection>
        )
    }

}

export default Movie;