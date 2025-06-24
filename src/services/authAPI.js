
import { pb, handlePocketBaseError } from './pocketbase';

export const authAPI = {
  login: async (credentials) => {
    try {
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
      handlePocketBaseError(error);
    }
  },

  validateToken: () => {
    return pb.authStore.isValid;
  },

  logout: () => {
    pb.authStore.clear();
  },

  getCurrentUser: () => {
    return pb.authStore.model;
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
      handlePocketBaseError(error);
    }
  }
};
