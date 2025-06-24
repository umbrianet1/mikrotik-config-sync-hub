
import { pb, handlePocketBaseError } from './pocketbase';

// Credenziali di fallback locali
const LOCAL_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    email: 'admin@mikrotik.local',
    role: 'admin'
  }
];

export const authAPI = {
  login: async (credentials) => {
    try {
      // Prima tenta l'autenticazione con PocketBase
      const authData = await pb.collection('users').authWithPassword(
        credentials.username,
        credentials.password
      );
      
      return {
        id: authData.record.id,
        username: authData.record.username,
        email: authData.record.email,
        role: authData.record.role || 'admin',
        token: authData.token
      };
    } catch (error) {
      console.log('PocketBase not available, using local authentication');
      
      // Fallback all'autenticazione locale
      const user = LOCAL_USERS.find(u => 
        u.username === credentials.username && 
        u.password === credentials.password
      );
      
      if (!user) {
        throw new Error('Credenziali non valide');
      }
      
      // Simula un token JWT locale
      const token = btoa(JSON.stringify({
        userId: user.id,
        username: user.username,
        timestamp: Date.now()
      }));
      
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: token
      };
    }
  },

  validateToken: () => {
    try {
      return pb.authStore.isValid;
    } catch {
      // Se PocketBase non è disponibile, verifica il token locale
      const localUser = localStorage.getItem('mikrotik_user');
      return !!localUser;
    }
  },

  logout: () => {
    try {
      pb.authStore.clear();
    } catch {
      // Ignora errori di PocketBase
    }
    localStorage.removeItem('mikrotik_user');
  },

  getCurrentUser: () => {
    try {
      return pb.authStore.model;
    } catch {
      // Fallback ai dati locali
      const localUser = localStorage.getItem('mikrotik_user');
      return localUser ? JSON.parse(localUser) : null;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const user = pb.authStore.model;
      if (!user) throw new Error('Utente non autenticato');

      await pb.collection('users').update(user.id, {
        password: newPassword,
        passwordConfirm: newPassword,
        oldPassword: currentPassword
      });

      return { success: true };
    } catch (error) {
      // Per l'autenticazione locale, implementa la logica di cambio password
      throw new Error('Cambio password non disponibile in modalità locale');
    }
  }
};
