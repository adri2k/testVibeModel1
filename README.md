# AeromodellismoFano - Sistema di Gestione Voli

Sistema web per la gestione dei voli dell'associazione AeromodellismoFano con frontend React e backend PHP.

## Funzionalità

- Autenticazione piloti con JWT
- Registrazione voli con informazioni complete
- Visualizzazione tutti i voli dell'associazione
- Dashboard personale per ogni pilota
- Tema scuro
- Database SQLite
- API REST

## Installazione

### Backend PHP

1. Vai nella cartella backend:
```bash
cd backend
```

2. Avvia il server PHP:
```bash
php -S localhost:8000
```

### Frontend React

1. Vai nella cartella frontend:
```bash
cd frontend
```

2. Installa le dipendenze:
```bash
npm install
```

3. Avvia il server di sviluppo:
```bash
npm run dev
```

4. Apri il browser su http://localhost:3000

## Credenziali di default

- Username: admin
- Password: admin123

## Struttura Progetto

```
├── backend/           # API PHP
│   ├── config.php     # Configurazione DB e JWT
│   ├── auth.php       # Endpoint autenticazione
│   ├── voli.php       # Endpoint gestione voli
│   └── index.php      # Info API
├── frontend/          # App React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── main.jsx
│   └── package.json
```

## API Endpoints

- `POST /auth.php` - Login
- `GET /voli.php` - Lista tutti i voli
- `GET /voli.php?miei=true` - Voli del pilota
- `POST /voli.php` - Nuovo volo

## Database Schema

### Tabella piloti
- id, username, password, nome, cognome, email

### Tabella voli  
- id, pilota_id, tipo_aereo, ora_inizio, durata, note