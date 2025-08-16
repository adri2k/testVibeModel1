import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Voli from './pages/Voli'
import NuovoVolo from './pages/NuovoVolo'
import Modelli from './pages/Modelli'
import { AuthProvider, useAuth } from './context/AuthContext'

function AppContent() {
  const { user } = useAuth()

  return (
    <div className="app">
      {user && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/voli" element={user ? <Voli /> : <Navigate to="/login" />} />
          <Route path="/nuovo-volo" element={user ? <NuovoVolo /> : <Navigate to="/login" />} />
          <Route path="/i-miei-voli" element={user ? <Voli miei={true} /> : <Navigate to="/login" />} />
          <Route path="/modelli" element={user ? <Modelli /> : <Navigate to="/login" />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>&copy; 2024 AeromodellismoFano - Gestione Voli</p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App