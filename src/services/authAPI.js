
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'mikrotik-manager-secret-key';

export const authAPI = {
  login: async (credentials) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.username === 'admin' && credentials.password === 'admin123') {
          const user = {
            id: 1,
            username: 'admin',
            role: 'admin',
            token: CryptoJS.AES.encrypt(JSON.stringify({ 
              username: 'admin', 
              exp: Date.now() + 24 * 60 * 60 * 1000 
            }), SECRET_KEY).toString()
          };
          resolve(user);
        } else {
          reject(new Error('Credenziali non valide'));
        }
      }, 1000);
    });
  },

  validateToken: (token) => {
    try {
      const decrypted = CryptoJS.AES.decrypt(token, SECRET_KEY);
      const data = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
      return data.exp > Date.now();
    } catch {
      return false;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }
};
