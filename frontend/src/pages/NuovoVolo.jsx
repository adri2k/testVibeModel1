import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const NuovoVolo = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
  model_id: '',
    ora_inizio: new Date().toISOString().slice(0, 16),
    durata: '',
    note: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [models, setModels] = useState([])

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await axios.get('/modelli.php?miei=true')
        setModels(res.data)
      } catch (err) {
        // ignore
      }
    }
    fetchModels()
  }, [])

  const handleChange = (e) => {
    // Se l'utente seleziona l'opzione per creare un nuovo modello, lo portiamo alla pagina modelli
    if (e.target.name === 'model_id' && e.target.value === 'create') {
      navigate('/modelli')
      return
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await axios.post('/voli.php', formData)
      setSuccess('Volo registrato con successo!')
      
      setTimeout(() => {
        navigate('/voli')
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.error || 'Errore durante la registrazione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="nuovo-volo-page">
      <div className="page-header">
        <h1>Registra Nuovo Volo</h1>
      </div>

      <div className="form-container">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="volo-form">
          <div className="form-group">
            <label htmlFor="model_id">Modello:</label>
            <select
              id="model_id"
              name="model_id"
              value={formData.model_id}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Seleziona modello (devi crearne almeno uno)</option>
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.nome} — {m.tipo} ({m.apertura_alare || '-'}, {m.peso_decollo || '-'})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="ora_inizio">Data e Ora Inizio:</label>
            <input
              type="datetime-local"
              id="ora_inizio"
              name="ora_inizio"
              value={formData.ora_inizio}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="durata">Durata (minuti):</label>
            <input
              type="number"
              id="durata"
              name="durata"
              value={formData.durata}
              onChange={handleChange}
              min="1"
              max="180"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="note">Note (opzionale):</label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows="3"
              placeholder="Condizioni meteo, performance, problemi..."
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? 'Registrazione...' : 'Registra Volo'}
            </button>
            <button 
              type="button"
              onClick={() => navigate('/voli')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NuovoVolo