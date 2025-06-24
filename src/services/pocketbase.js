
import PocketBase from 'pocketbase';

// Configura l'URL del tuo server PocketBase
const PB_URL = 'http://localhost:8090'; // Cambia questo con l'URL del tuo server PocketBase

// URL del backend Node.js per le connessioni ai router
export const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-server-ip:3001' // Sostituisci con l'IP del tuo server Ubuntu
  : 'http://localhost:3001';

export const pb = new PocketBase(PB_URL);

// Configurazione delle collezioni
export const COLLECTIONS = {
  ROUTERS: 'routers',
  ADDRESS_LISTS: 'address_lists',
  FIREWALL_RULES: 'firewall_rules',
  USERS: 'users'
};

// Helper per gestire gli errori
export const handlePocketBaseError = (error) => {
  console.error('PocketBase Error:', error);
  if (error.response) {
    throw new Error(error.response.message || 'Errore del server');
  }
  throw new Error('Errore di connessione al server');
};

// Verifica la connessione al server
export const testConnection = async () => {
  try {
    await pb.health.check();
    return true;
  } catch (error) {
    console.error('PocketBase connection failed:', error);
    return false;
  }
};
