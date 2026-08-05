import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import "../css/Player.css";

function Player({ movieId, type = "movie", season = 1, episode = 1, onClose }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const node = containerRef.current;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        if (node?.requestFullscreen) {
            node.requestFullscreen().catch(() => {});
        }

        function onKey(e) {
            if (e.key === "Escape") onClose();
        }
        window.addEventListener("keydown", onKey);

        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
        };
    }, [onClose]);

    const src =
        type === "tv"
            ? `https://www.vidking.net/embed/tv/${movieId}/${season}/${episode}?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true`
            : `https://www.vidking.net/embed/movie/${movieId}?color=e50914&autoPlay=true`;

    return (
        <div className="player" ref={containerRef}>
            <iframe
                className="player__frame"
                src={src}
                title="Video player"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
            <button className="player__close" type="button" aria-label="Close player" onClick={onClose}>
                <X size={26} />
            </button>
        </div>
    );
}

export default Player;