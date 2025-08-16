import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-title">🛩️ AeromodellismoFano</h1>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/voli" 
            className={`nav-link ${isActive('/voli') ? 'active' : ''}`}
          >
            Tutti i Voli
          </Link>
          <Link 
            to="/i-miei-voli" 
            className={`nav-link ${isActive('/i-miei-voli') ? 'active' : ''}`}
          >
            I Miei Voli
          </Link>
          <Link 
            to="/nuovo-volo" 
            className={`nav-link ${isActive('/nuovo-volo') ? 'active' : ''}`}
          >
            Nuovo Volo
          </Link>
          <Link 
            to="/modelli" 
            className={`nav-link ${isActive('/modelli') ? 'active' : ''}`}
          >
            Modelli
          </Link>
          <span className="user-info">Ciao, {user?.nome}!</span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar