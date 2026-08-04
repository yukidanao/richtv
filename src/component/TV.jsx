import { useState, useEffect, useMemo, useRef } from "react";
import { urls } from "../constants/urls";
import '../css/TV.css'

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

function TV() {
    const [tvshows, setTVShows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        async function loadTVShows() {
            setLoading(true);
            const response = await fetch(urls.tvUrl);
            const data = await response.json();

            setTVShows(data);
            setLoading(false)
        }

        loadTVShows();

    }, []);

    useEffect(() => {
        async function loadTVGenres() {
            const response = await fetch(urls.tvGenre);
            const data = await response.json();

            setGenres(data.genres);
        }

        loadTVGenres();
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
                <p>Loading TV Shows...</p>
            </RevealSection>
        )
    } else {
        return (
            <RevealSection>
                <>
                    <h1 className="title">Discover TV Shows</h1>

                    <div className="tv-grid">
                        {tvshows.map(tvshow => (
                        <div className="tv-card" key={tvshow.id}>

                            <div className="poster">

                                <img src={`https://image.tmdb.org/t/p/w500${tvshow.poster_path}`} />

                                <span className="rating">★ {tvshow.vote_average}</span>

                            </div>

                            <div className="info">

                                <h3>{tvshow.original_name}</h3>

                                {/* <div className="meta">
                                    <span>2014</span>
                                    <span>169 min</span>
                                    <span>PG-13</span>
                                </div> */}


                                <div className="genres">
                                    {tvshow.genre_ids
                                        .map(id => genreMap[id])
                                        .filter(Boolean)
                                        .map(genre => (
                                            <span key={genre}>{genre}</span>
                                        ))}
                                </div>

                                <p>
                                    Description
                                </p>

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
                </>
            </RevealSection>
        )
    }

}

export default TV;