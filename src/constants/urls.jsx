const baseUrl = 'https://richtvapi.vercel.app/api/movies';

export const urls = {
    allMovieList: `${baseUrl}/all`,
    searchMovie: `${baseUrl}/search`,
    movieUrl: `${baseUrl}/discover/movies`,
    nowPlayingUrl: `${baseUrl}/nowplaying/movies`,
    movieGenre: `${baseUrl}/genre`,
    tvGenre: `${baseUrl}/genre/tv`,
    tvUrl: `${baseUrl}/discover/tv`,
    movieDetails: `${baseUrl}/details`,
    movieLogo: `${baseUrl}/logo`,
    movieCast: `${baseUrl}/cast`,
    movieRecommendation: `${baseUrl}/recommendations`,
    movieTrailer: `${baseUrl}/trailer`,
    allTVList: `${baseUrl}/tv/all`,
    searchTV: `${baseUrl}/tv/search`,
    tvDetails: `${baseUrl}/tv/details`,
    tvLogo: `${baseUrl}/tv/logo`,
    tvTrailer: `${baseUrl}/tv/trailer`,
    tvCast: `${baseUrl}/tv/cast`,
    tvRecommendation: `${baseUrl}/tv/recommendations`
};