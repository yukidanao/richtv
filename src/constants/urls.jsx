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
    movieRecommendation: `${baseUrl}/recommendations`
};