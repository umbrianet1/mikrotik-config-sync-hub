
# MikroTik Manager Backend

Backend Node.js con Express per gestire router MikroTik via SSH.

## Caratteristiche

- 🔐 Connessioni SSH sicure ai router MikroTik
- 🚀 API REST per gestione completa dei router
- 🛡️ Middleware di sicurezza e rate limiting
- 📝 Logging completo delle operazioni
- ⚡ Pool di connessioni per prestazioni ottimali
- 🔍 Validazione input e sanitizzazione

## Installazione

```bash
# Clona o scarica il progetto
cd backend

# Installa le dipendenze
npm install

# Copia il file di configurazione
cp .env.example .env

# Modifica le configurazioni nel file .env
nano .env

# Avvia il server in modalità sviluppo
npm run dev

# Oppure in modalità produzione
npm start
```

## Configurazione

Crea un file `.env` basato su `.env.example`:

```env
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=http://your-frontend-domain.com
SSH_TIMEOUT=10000
```

## API Endpoints

### Health Check
- `GET /api/health` - Verifica stato del server

### Router Management
- `POST /api/router/test-connection` - Test connessione router
- `POST /api/router/info` - Informazioni router
- `POST /api/router/address-lists` - Gestione address lists
- `POST /api/router/firewall-rules` - Gestione regole firewall

## Struttura del Progetto

```
backend/
├── controllers/         # Controller per gestire le richieste
├── middleware/         # Middleware personalizzati
├── routes/            # Definizione delle rotte
├── services/          # Servizi per connessioni SSH
├── utils/             # Utility e helper functions
├── server.js          # File principale del server
└── package.json       # Dipendenze e script
```

## Sicurezza

- Rate limiting per prevenire attacchi DDoS
- Validazione e sanitizzazione degli input
- CORS configurabile
- Helmet.js per security headers
- Gestione sicura delle credenziali SSH

## Monitoraggio

Il server include logging completo con Morgan e gestione errori dettagliata.

## Deployment

Per il deployment su Ubuntu Server:

```bash
# Installa Node.js e npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clona il progetto
git clone <your-repo> /opt/mikrotik-backend
cd /opt/mikrotik-backend

# Installa dipendenze
npm install --production

# Configura PM2 per gestione processi
sudo npm install -g pm2
pm2 start server.js --name "mikrotik-backend"
pm2 startup
pm2 save

# Configura nginx come reverse proxy (opzionale)
sudo apt install nginx
# Configura nginx per proxy verso localhost:3001
```

## Supporto

Per problemi o domande, controlla i log del server:

```bash
# Logs con PM2
pm2 logs mikrotik-backend

# Logs diretti
npm run dev
```
