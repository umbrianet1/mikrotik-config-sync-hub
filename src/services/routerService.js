
import { pb, COLLECTIONS, handlePocketBaseError } from './pocketbase';

export const routerService = {
  // Recupera tutti i router dell'utente
  getRouters: async () => {
    try {
      const records = await pb.collection(COLLECTIONS.ROUTERS).getFullList({
        sort: 'created'
      });

      return records.map(record => ({
        id: record.id,
        name: record.name,
        ip: record.ip,
        username: record.username,
        password: record.password, // In produzione dovrebbe essere crittografata
        port: record.port,
        connectionMethod: record.connection_method,
        isMaster: record.is_master,
        dateAdded: record.created
      }));
    } catch (error) {
      handlePocketBaseError(error);
    }
  },

  // Aggiungi un nuovo router
  addRouter: async (routerData) => {
    try {
      const record = await pb.collection(COLLECTIONS.ROUTERS).create({
        name: routerData.name,
        ip: routerData.ip,
        username: routerData.username,
        password: routerData.password, // In produzione dovrebbe essere crittografata
        port: routerData.port,
        connection_method: routerData.connectionMethod,
        is_master: routerData.isMaster || false,
        user_id: pb.authStore.model?.id
      });

      return {
        id: record.id,
        name: record.name,
        ip: record.ip,
        username: record.username,
        password: record.password,
        port: record.port,
        connectionMethod: record.connection_method,
        isMaster: record.is_master,
        dateAdded: record.created
      };
    } catch (error) {
      handlePocketBaseError(error);
    }
  },

  // Aggiorna un router
  updateRouter: async (routerId, routerData) => {
    try {
      const record = await pb.collection(COLLECTIONS.ROUTERS).update(routerId, {
        name: routerData.name,
        ip: routerData.ip,
        username: routerData.username,
        password: routerData.password,
        port: routerData.port,
        connection_method: routerData.connectionMethod,
        is_master: routerData.isMaster
      });

      return {
        id: record.id,
        name: record.name,
        ip: record.ip,
        username: record.username,
        password: record.password,
        port: record.port,
        connectionMethod: record.connection_method,
        isMaster: record.is_master,
        dateAdded: record.created
      };
    } catch (error) {
      handlePocketBaseError(error);
    }
  },

  // Elimina un router
  deleteRouter: async (routerId) => {
    try {
      await pb.collection(COLLECTIONS.ROUTERS).delete(routerId);
      return { success: true };
    } catch (error) {
      handlePocketBaseError(error);
    }
  },

  // Imposta un router come master
  setAsMaster: async (routerId) => {
    try {
      // Prima rimuovi il flag master da tutti i router
      const allRouters = await pb.collection(COLLECTIONS.ROUTERS).getFullList();
      
      for (const router of allRouters) {
        if (router.is_master) {
          await pb.collection(COLLECTIONS.ROUTERS).update(router.id, {
            is_master: false
          });
        }
      }

      // Poi imposta il router selezionato come master
      await pb.collection(COLLECTIONS.ROUTERS).update(routerId, {
        is_master: true
      });

      return { success: true };
    } catch (error) {
      handlePocketBaseError(error);
    }
  }
};
