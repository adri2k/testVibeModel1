import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Voli = ({ miei = false }) => {
  const [voli, setVoli] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVoli()
  }, [miei])

  const fetchVoli = async () => {
    try {
      setLoading(true)
      const url = miei ? '/voli.php?miei=true' : '/voli.php'
      const response = await axios.get(url)
      setVoli(response.data)
    } catch (err) {
      setError('Errore nel caricamento dei voli')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('it-IT')
  }

  const getTotalMinutes = () => {
    return voli.reduce((total, volo) => total + parseInt(volo.durata), 0)
  }

  const deleteVolo = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questo volo?')) return
    try {
      await axios.delete(`/voli.php?id=${id}`)
      // Rimuovi localmente
      setVoli((prev) => prev.filter((v) => v.id !== id))
    } catch (err) {
      alert(err.response?.data?.error || 'Errore durante la cancellazione')
    }
  }

  if (loading) return <div className="loading">Caricamento voli...</div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="voli-page">
      <div className="page-header">
        <h1>{miei ? 'I Miei Voli' : 'Tutti i Voli'}</h1>
        <Link to="/nuovo-volo" className="btn btn-success">Nuovo Volo</Link>
      </div>

      {miei && voli.length > 0 && (
        <div className="stats-summary">
          <div className="stat-card">
            <h3>{voli.length}</h3>
            <p>Voli Totali</p>
          </div>
          <div className="stat-card">
            <h3>{getTotalMinutes()}</h3>
            <p>Minuti di Volo</p>
          </div>
        </div>
      )}

      <div className="voli-container">
        {voli.length > 0 ? (
          <div className="voli-grid">
            {voli.map((volo) => (
              <div key={volo.id} className="volo-card">
                <div className="volo-header">
                  <h3>{volo.tipo_aereo}</h3>
                  <span className="durata">{volo.durata} min</span>
                </div>
                <div className="volo-info">
                  {!miei && (
                    <p><strong>Pilota:</strong> {volo.nome} {volo.cognome}</p>
                  )}
                  <p><strong>Inizio:</strong> {formatDateTime(volo.ora_inizio)}</p>
                  {volo.note && (
                    <p><strong>Note:</strong> {volo.note}</p>
                  )}
                  {volo.modello_nome && (
                    <p><strong>Modello:</strong> {volo.modello_nome} — {volo.modello_tipo} {volo.apertura_alare ? `(${volo.apertura_alare})` : ''}</p>
                  )}
                  {miei && (
                    <div className="volo-actions">
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteVolo(volo.id)}
                        aria-label="Elimina volo"
                        title="Elimina volo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                          <path d="M10 11v6"></path>
                          <path d="M14 11v6"></path>
                          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>{miei ? 'Non hai ancora registrato nessun volo' : 'Nessun volo registrato'}</p>
            <Link to="/nuovo-volo" className="btn btn-primary">
              {miei ? 'Registra il tuo primo volo' : 'Registra il primo volo'}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Voli