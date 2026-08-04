import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Info, ChevronLeft, ChevronRight, Volume2, VolumeX, BadgeCheck } from "lucide-react";
import { urls } from "../constants/urls";
import '../css/Hero.css'

const DEFAULT_SLIDES = [
    {
        id: 1,
        title: "Nightfall District",
        rating: "97%",
        year: "2026",
        maturity: "16+",
        duration: "2h 8m",
        genres: ["Crime", "Thriller", "Drama"],
        desc: "A disgraced detective is pulled back into the city's underworld when a decade-old case resurfaces, forcing her to choose between the badge and the truth.",
        image: "https://picsum.photos/id/1039/1600/900",
    },
    {
        id: 2,
        title: "Glass Horizon",
        rating: "91%",
        year: "2025",
        maturity: "13+",
        duration: "1 Season",
        genres: ["Sci-Fi", "Mystery"],
        desc: "When a research station on the edge of the solar system goes silent, a small crew is sent to find out why — and what they discover changes everything.",
        image: "https://picsum.photos/id/1015/1600/900",
    },
    {
        id: 3,
        title: "Paper Lanterns",
        rating: "88%",
        year: "2026",
        maturity: "PG-13",
        duration: "1h 54m",
        genres: ["Drama", "Romance"],
        desc: "Two estranged siblings return to their childhood home for one last summer before it's sold, uncovering family secrets that were never meant to surface.",
        image: "https://picsum.photos/id/1043/1600/900",
    },
];

const AUTOPLAY_MS = 6500;

function Hero({ slides = DEFAULT_SLIDES, onPlay, onInfo }) {
    const [current, setCurrent] = useState(0);
    const [muted, setMuted] = useState(true);
    const [paused, setPaused] = useState(false);
    const [fillKey, setFillKey] = useState(0);
    const [fetchedSlides, setFetchedSlides] = useState([]);

    const slideItems = fetchedSlides.length ? fetchedSlides : slides;
    const timerRef = useRef(null);

    const goTo = useCallback(
        (index) => {
            const next = (index + slideItems.length) % slideItems.length;
            setCurrent(next);
            setFillKey((k) => k + 1);
        },
        [slideItems.length]
    );

    const handleNext = useCallback(() => goTo(current + 1), [current, goTo]);
    const handlePrev = useCallback(() => goTo(current - 1), [current, goTo]);

    useEffect(() => {
        async function loadSlideData() {
            const response = await fetch(urls.nowPlayingUrl);
            if (!response.ok) return;

            const data = await response.json();
            if (!Array.isArray(data)) return;

            setFetchedSlides(
                data.map((item) => ({
                    id: item.id,
                    title: item.title || item.name || 'Untitled',
                    rating: item.vote_average ? `${Math.round(item.vote_average * 10)}%` : 'NR',
                    year:
                        item.release_date?.slice(0, 4) ||
                        item.first_air_date?.slice(0, 4) ||
                        '',
                    maturity: item.adult ? '18+' : 'PG-13',
                    duration: item.release_date || '',
                    genres: Array.isArray(item.genre_ids) ? item.genre_ids.map(String) : [],
                    desc: item.overview || '',
                    image: item.backdrop_path
                        ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
                        : item.poster_path
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                        : '',
                }))
            );
        }

        loadSlideData();
    }, []);

    // autoplay
    useEffect(() => {
        if (paused) return;
        timerRef.current = setInterval(() => {
            setCurrent((c) => (c + 1) % slideItems.length);
            setFillKey((k) => k + 1);
        }, AUTOPLAY_MS);
        return () => clearInterval(timerRef.current);
    }, [paused, slideItems.length]);

    const active = slideItems[current] || slideItems[0];

    return (
        <section
            className="hero"
            aria-roledescription="carousel"
            aria-label="Featured titles"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >

            <div className="hero__slides">
                {slideItems.map((s, i) => (
                    <div key={s.id} className={`hero__slide${i === current ? " is-active" : ""}`}>
                        <img src={s.image} alt={`${s.title} backdrop`} />
                    </div>
                ))}
            </div>

            <div className="hero__scrim-top" />
            <div className="hero__scrim-side" />
            <div className="hero__scrim-bottom" />

            <button className="hero__arrow hero__arrow--prev" aria-label="Previous title" onClick={handlePrev}>
                <ChevronLeft size={30} />
            </button>
            <button className="hero__arrow hero__arrow--next" aria-label="Next title" onClick={handleNext}>
                <ChevronRight size={30} />
            </button>

            <div className="hero__content">
                <div className="hero__panel">
                    <span className="hero__tag">
                        <BadgeCheck size={18} />
                        Featured Title
                    </span>

                    <h1 className="hero__title">{active.title}</h1>

                    <div className="hero__meta">
                        <span className="hero__rating">{active.rating} Match</span>
                        <span>{active.year}</span>
                        <span className="hero__badge">{active.maturity}</span>
                        <span>{active.duration}</span>
                        <span className="hero__sep" />
                        <span className="hero__genres">
                            {active.genres.map((g) => (
                                <span key={g}>{g}</span>
                            ))}
                        </span>
                    </div>

                    <p className="hero__desc">{active.desc}</p>

                    <div className="hero__actions">
                        <button className="hero__btn hero__btn--play" onClick={() => onPlay?.(active)}>
                            <Play size={20} fill="#141414" />
                            Play
                        </button>
                        <button className="hero__btn hero__btn--info" onClick={() => onInfo?.(active)}>
                            <Info size={20} />
                            More Info
                        </button>
                    </div>
                </div>
            </div>

            <button className="hero__mute" aria-label="Toggle background audio" onClick={() => setMuted((m) => !m)}>
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <div className="hero__indicators">
                {slideItems.map((s, i) => (
                    <button
                        key={s.id}
                        className={`hero__indicator${i === current ? " is-active" : ""}`}
                        aria-label={`Go to ${s.title}`}
                        onClick={() => goTo(i)}
                    >
                        <span key={i === current ? fillKey : "idle"} className={i === current && !paused ? "animate" : ""} />
                    </button>
                ))}
            </div>
        </section>
    );
}

export default Hero;