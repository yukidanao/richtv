import { Routes, Route, useLocation, useNavigate } from 'react-router'
import { useEffect } from 'react'
import './App.css'
import Movie from './component/Movie'
import Navbar from './component/Navbar'
import Hero from './component/Hero'
import TV from './component/TV'
import MovieList from './component/MovieList'
import MovieDetails from './component/MovieDetails'
import TVList from './component/TVList'
import TVDetails from './component/TVDetails'

function App() {
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [location.pathname])

    const openMovie = (id) => navigate(`/movie/${id}`)

    return (
        <>
            <Navbar />
            <Routes>
                <Route
                    path='/'
                    element={
                        <>
                            <Hero onPlay={(m) => openMovie(m.id)} onInfo={(m) => openMovie(m.id)} />
                            <main className="page-content">
                                <Movie />
                            </main>
                            <main className="page-content">
                                <TV />
                            </main>
                        </>
                    }
                />
                <Route path='/movies' element={<MovieList />} />
                <Route path='/tv' element={<TVList />} />
                <Route path='/tv/:tvId' element={<TVDetails />} />
                <Route path='/movie/:movieId' element={<MovieDetails />} />
            </Routes>
        </>
    )
}

export default App
