import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const [nome, setNome] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await axios.post('/register.php', { nome, telefono, email, password })
      if (res.data?.success) {
        // Salva token e user e reindirizza
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
        navigate('/')
      } else {
        setError(res.data?.error || 'Errore durante la registrazione')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Registrazione Nuovo Pilota</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="nome">Nome e Cognome</label>
            <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={loading} />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Telefono</label>
            <input id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} required disabled={loading} />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Registrazione...' : 'Registrati'}</button>
        </form>

      </div>
    </div>
  )
}

export default Register
