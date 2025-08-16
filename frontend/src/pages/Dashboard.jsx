import React from 'react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h1>Benvenuto nel Sistema di Gestione Voli</h1>
        <p>Associazione AeromodellismoFano</p>
      </div>

      <div className="dashboard-cards">
        <div className="card">
          <h3>📋 Tutti i Voli</h3>
          <p>Visualizza tutti i voli registrati</p>
          <Link to="/voli" className="btn btn-primary">Visualizza</Link>
        </div>

        <div className="card">
          <h3>✈️ I Miei Voli</h3>
          <p>Visualizza i tuoi voli personali</p>
          <Link to="/i-miei-voli" className="btn btn-primary">Visualizza</Link>
        </div>

        <div className="card">
          <h3>➕ Nuovo Volo</h3>
          <p>Registra un nuovo volo</p>
          <Link to="/nuovo-volo" className="btn btn-success">Registra</Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard