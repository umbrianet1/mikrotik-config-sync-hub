
import { apiCall } from './httpClient';

export const connectionService = {
  // Test di connessione reale al router
  testConnection: async (router) => {
    try {
      console.log('Testing connection to router:', router.name, router.ip);
      
      const result = await apiCall('/router/test-connection', 'POST', {
        router: {
          ip: router.ip,
          username: router.username,
          password: router.password,
          port: router.port,
          connectionMethod: router.connectionMethod
        }
      });
      
      return result;
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        status: 'offline',
        message: error.message || 'Impossibile connettersi al router',
        latency: null
      };
    }
  },

  // Informazioni del router tramite API reale
  getRouterInfo: async (router) => {
    try {
      console.log('Getting router info for:', router.name);
      
      const result = await apiCall('/router/info', 'POST', {
        router: {
          ip: router.ip,
          username: router.username,
          password: router.password,
          port: router.port,
          connectionMethod: router.connectionMethod
        }
      });
      
      return result;
    } catch (error) {
      console.error('Failed to get router info:', error);
      throw error;
    }
  }
};
