import { Link } from 'react-router'
import { useEffect, useState } from 'react'
import { Search, Menu } from 'lucide-react'
import SearchModal from './SearchModal'
import '../css/Header.css'

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)

    useEffect(() => {
        function onScroll() {
            setScrolled(window.scrollY > 10)
        }

        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
            <div className="navbar-top">
                <a href="#" className="navbar-brand">
                    <span className="brand-badge">R</span>
                    <span>Rich TV</span>
                </a>

                <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
                    <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
                    <li><Link to="/movies" onClick={() => setMenuOpen(false)}>Movies</Link></li>
                    <li><Link to="/tv" onClick={() => setMenuOpen(false)}>TV Shows</Link></li>
                    <li><a href="#" onClick={() => setMenuOpen(false)}>New & Popular</a></li>
                    <li><a href="#" onClick={() => setMenuOpen(false)}>My List</a></li>
                    <li className="mobile-actions">
                        <button className="nav-icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
                            <Search size={20} />
                        </button>
                        <div className="profile-avatar">L</div>
                    </li>
                </ul>

                <div className="nav-actions">
                    <button className="nav-icon desktop-only" aria-label="Search" onClick={() => setSearchOpen(true)}>
                        <Search size={20} />
                    </button>
                    <div className="profile-avatar desktop-only">L</div>
                    <button
                        className="menu-toggle mobile-only"
                        aria-label="Toggle menu"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            <SearchModal key={String(searchOpen)} open={searchOpen} onClose={() => setSearchOpen(false)} />
        </nav>
    )
}

export default Navbar;