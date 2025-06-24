
import { apiCall } from './httpClient';
import { pb, COLLECTIONS, handlePocketBaseError } from '../pocketbase';

export const addressListService = {
  // Gestione Address Lists con API reale
  fetchAddressLists: async (router) => {
    try {
      console.log('Fetching address lists for router:', router.id);
      
      // Prima controlla se ci sono dati salvati in PocketBase
      const savedLists = await pb.collection(COLLECTIONS.ADDRESS_LISTS)
        .getList(1, 50, {
          filter: `router_id = "${router.id}"`
        });

      // Se richiesto refresh o dati non presenti, recupera dal router
      if (savedLists.items.length === 0) {
        try {
          const routerLists = await apiCall('/router/address-lists', 'POST', {
            router: {
              ip: router.ip,
              username: router.username,
              password: router.password,
              port: router.port,
              connectionMethod: router.connectionMethod
            }
          });

          // Salva i dati in PocketBase per cache
          for (const list of routerLists) {
            try {
              await pb.collection(COLLECTIONS.ADDRESS_LISTS).create({
                router_id: router.id,
                list_name: list.list,
                address: list.address,
                comment: list.comment,
                timeout: list.timeout
              });
            } catch (error) {
              console.warn('Could not cache address list:', error);
            }
          }

          return routerLists;
        } catch (error) {
          console.warn('Failed to fetch from router, using cached data:', error);
        }
      }

      return savedLists.items.map(item => ({
        id: item.id,
        list: item.list_name,
        address: item.address,
        comment: item.comment,
        timeout: item.timeout
      }));
    } catch (error) {
      handlePocketBaseError(error);
    }
  },

  createAddressList: async (router, addressList) => {
    try {
      console.log('Creating address list:', addressList);
      
      // Applica al router tramite API
      await apiCall('/router/address-lists', 'POST', {
        router: {
          ip: router.ip,
          username: router.username,
          password: router.password,
          port: router.port,
          connectionMethod: router.connectionMethod
        },
        action: 'create',
        data: addressList
      });

      // Crea in PocketBase
      const record = await pb.collection(COLLECTIONS.ADDRESS_LISTS).create({
        router_id: router.id,
        list_name: addressList.list,
        address: addressList.address,
        comment: addressList.comment,
        timeout: addressList.timeout
      });

      return {
        id: record.id,
        list: record.list_name,
        address: record.address,
        comment: record.comment,
        timeout: record.timeout
      };
    } catch (error) {
      handlePocketBaseError(error);
    }
  },

  updateAddressList: async (router, addressList) => {
    try {
      console.log('Updating address list:', addressList);
      
      // Aggiorna sul router
      await apiCall('/router/address-lists', 'PUT', {
        router: {
          ip: router.ip,
          username: router.username,
          password: router.password,
          port: router.port,
          connectionMethod: router.connectionMethod
        },
        action: 'update',
        data: addressList
      });

      // Aggiorna in PocketBase
      const record = await pb.collection(COLLECTIONS.ADDRESS_LISTS).update(addressList.id, {
        list_name: addressList.list,
        address: addressList.address,
        comment: addressList.comment,
        timeout: addressList.timeout
      });

      return {
        id: record.id,
        list: record.list_name,
        address: record.address,
        comment: record.comment,
        timeout: record.timeout
      };
    } catch (error) {
      handlePocketBaseError(error);
    }
  },

  deleteAddressList: async (router, addressListId) => {
    try {
      console.log('Deleting address list:', addressListId);
      
      const record = await pb.collection(COLLECTIONS.ADDRESS_LISTS).getOne(addressListId);
      
      // Rimuovi dal router
      await apiCall('/router/address-lists', 'DELETE', {
        router: {
          ip: router.ip,
          username: router.username,
          password: router.password,
          port: router.port,
          connectionMethod: router.connectionMethod
        },
        action: 'delete',
        data: {
          list: record.list_name,
          address: record.address
        }
      });
      
      // Rimuovi da PocketBase
      await pb.collection(COLLECTIONS.ADDRESS_LISTS).delete(addressListId);

      return { success: true };
    } catch (error) {
      handlePocketBaseError(error);
    }
  }
};
