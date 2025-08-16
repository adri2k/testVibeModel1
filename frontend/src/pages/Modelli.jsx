import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const Modelli = () => {
  const [models, setModels] = useState([])
  const [form, setForm] = useState({ tipo: '', apertura_alare: '', peso_decollo: '', nome: '' })
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const tipi = [
    'Trainer',
    'Acrobatico',
    'Jet',
    'Elicottero',
    'Aliante',
    'Drone/FPV',
    'Biplano',
    'Warbird',
    'Altro'
  ]

  const fetchModels = async () => {
    try {
      const res = await axios.get('/modelli.php?miei=true')
      setModels(res.data)
    } catch (err) {
      // ignore
    }
  }

  useEffect(() => { fetchModels() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/modelli.php', form)
      if (res.data?.success) {
        setModels(prev => [res.data.model, ...prev])
        setForm({ tipo: '', apertura_alare: '', peso_decollo: '', nome: '' })
      } else {
        setError(res.data?.error || 'Errore')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Errore di connessione')
    } finally { setLoading(false) }
  }

  const handleEdit = (model) => {
  setEditing(model.id)
  setForm({ tipo: model.tipo, apertura_alare: model.apertura_alare || '', peso_decollo: model.peso_decollo || '', nome: model.nome })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.put(`/modelli.php?id=${editing}`, form)
      if (res.data?.success) {
        setModels(prev => prev.map(m => m.id === editing ? res.data.model : m))
        setEditing(null)
        setForm({ tipo: '', apertura_alare: '', peso_decollo: '', nome: '' })
      } else {
        setError(res.data?.error || 'Errore')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Errore di connessione')
    } finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminare questo modello?')) return
    try {
      const res = await axios.delete(`/modelli.php?id=${id}`)
      if (res.data?.success) {
        setModels(prev => prev.filter(m => m.id !== id))
      } else {
        alert(res.data?.error || 'Errore')
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Errore di connessione')
    }
  }

  return (
    <div className="modelli-page">
      <div className="page-header">
        <h1>Anagrafica Aeromodelli</h1>
        <Link to="/nuovo-volo" className="btn btn-success">Registra Volo</Link>
      </div>

      <div className="form-container">
        {error && <div className="alert alert-error">{error}</div>}
  <form onSubmit={editing ? handleUpdate : handleSubmit} className="volo-form">
          <div className="form-group">
            <label>Tipo</label>
            <select name="tipo" value={form.tipo} onChange={handleChange} required>
              <option value="">Seleziona tipo</option>
              {tipi.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Apertura alare</label>
            <input name="apertura_alare" value={form.apertura_alare} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Peso al decollo</label>
            <input name="peso_decollo" value={form.peso_decollo} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Nome</label>
            <input name="nome" value={form.nome} onChange={handleChange} required />
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" disabled={loading}>{loading ? 'Salvataggio...' : (editing ? 'Aggiorna Modello' : 'Crea Modello')}</button>
            {editing && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm({ tipo: '', apertura_alare: '', peso_decollo: '', nome: '' }) }}>Annulla</button>
            )}
          </div>
        </form>

        <div style={{ marginTop: 20 }}>
          <h2>I miei modelli</h2>
          {models.length === 0 ? (
            <p>Nessun modello. Creane uno per poter registrare voli.</p>
          ) : (
            <div className="voli-grid">
              {models.map(m => (
                <div key={m.id} className="card" onClick={() => handleEdit(m)} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ color: 'var(--accent-primary)', marginBottom: 6 }}>{m.nome}</h3>
                      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{m.tipo} {m.apertura_alare ? `• ${m.apertura_alare}` : ''} {m.peso_decollo ? `• ${m.peso_decollo}` : ''}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); handleEdit(m); }}>Modifica</button>
                      <button className="btn btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}>Elimina</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Modal di modifica */}
        {editing && (
          <div className="modal-overlay" onClick={() => setEditing(null)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <h3>Modifica Modello</h3>
              <form onSubmit={handleUpdate} className="volo-form">
                <div className="form-group">
                  <label>Tipo</label>
                  <select name="tipo" value={form.tipo} onChange={handleChange} required>
                    <option value="">Seleziona tipo</option>
                    {['Trainer','Acrobatico','Jet','Elicottero','Aliante','Drone/FPV','Biplano','Warbird','Altro'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Apertura alare</label>
                  <input name="apertura_alare" value={form.apertura_alare} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Peso al decollo</label>
                  <input name="peso_decollo" value={form.peso_decollo} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Nome</label>
                  <input name="nome" value={form.nome} onChange={handleChange} required />
                </div>
                <div className="form-actions">
                  <button className="btn btn-primary" disabled={loading}>{loading ? 'Salvataggio...' : 'Aggiorna'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Chiudi</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Modelli
