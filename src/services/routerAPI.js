
import { pb, COLLECTIONS, handlePocketBaseError, BACKEND_URL } from './pocketbase';

// Helper per chiamate API al backend
const apiCall = async (endpoint, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${BACKEND_URL}/api${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export const routerAPI = {
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
      handlePocketBaseError(error);
    }
  },

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

  fetchFirewallRules: async (router) => {
    try {
      console.log('Fetching firewall rules for router:', router.id);
      
      const savedRules = await pb.collection(COLLECTIONS.FIREWALL_RULES)
        .getList(1, 50, {
          filter: `router_id = "${router.id}"`
        });

      if (savedRules.items.length === 0) {
        try {
          const routerRules = await apiCall('/router/firewall-rules', 'POST', {
            router: {
              ip: router.ip,
              username: router.username,
              password: router.password,
              port: router.port,
              connectionMethod: router.connectionMethod
            }
          });

          // Salva in cache
          for (const rule of routerRules) {
            try {
              await pb.collection(COLLECTIONS.FIREWALL_RULES).create({
                router_id: router.id,
                chain: rule.chain,
                action: rule.action,
                src_address: rule.srcAddress,
                dst_port: rule.dstPort,
                protocol: rule.protocol,
                comment: rule.comment,
                disabled: rule.disabled
              });
            } catch (error) {
              console.warn('Could not cache firewall rule:', error);
            }
          }

          return routerRules;
        } catch (error) {
          console.warn('Failed to fetch from router, using cached data:', error);
        }
      }

      return savedRules.items.map(item => ({
        id: item.id,
        chain: item.chain,
        action: item.action,
        srcAddress: item.src_address,
        dstPort: item.dst_port,
        protocol: item.protocol,
        comment: item.comment,
        disabled: item.disabled
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
  },

  createFirewallRule: async (router, rule) => {
    try {
      console.log('Creating firewall rule:', rule);
      
      // Applica al router
      await apiCall('/router/firewall-rules', 'POST', {
        router: {
          ip: router.ip,
          username: router.username,
          password: router.password,
          port: router.port,
          connectionMethod: router.connectionMethod
        },
        action: 'create',
        data: rule
      });

      // Crea in PocketBase
      const record = await pb.collection(COLLECTIONS.FIREWALL_RULES).create({
        router_id: router.id,
        chain: rule.chain,
        action: rule.action,
        src_address: rule.srcAddress,
        dst_port: rule.dstPort,
        protocol: rule.protocol,
        comment: rule.comment,
        disabled: rule.disabled
      });

      return {
        id: record.id,
        chain: record.chain,
        action: record.action,
        srcAddress: record.src_address,
        dstPort: record.dst_port,
        protocol: record.protocol,
        comment: record.comment,
        disabled: record.disabled
      };
    } catch (error) {
      handlePocketBaseError(error);
    }
  },

  updateFirewallRule: async (router, rule) => {
    try {
      console.log('Updating firewall rule:', rule);
      
      // Aggiorna sul router
      await apiCall('/router/firewall-rules', 'PUT', {
        router: {
          ip: router.ip,
          username: router.username,
          password: router.password,
          port: router.port,
          connectionMethod: router.connectionMethod
        },
        action: 'update',
        data: rule
      });

      // Aggiorna in PocketBase
      const record = await pb.collection(COLLECTIONS.FIREWALL_RULES).update(rule.id, {
        chain: rule.chain,
        action: rule.action,
        src_address: rule.srcAddress,
        dst_port: rule.dstPort,
        protocol: rule.protocol,
        comment: rule.comment,
        disabled: rule.disabled
      });

      return rule;
    } catch (error) {
      handlePocketBaseError(error);
    }
  },

  deleteFirewallRule: async (router, ruleId) => {
    try {
      console.log('Deleting firewall rule:', ruleId);
      
      const record = await pb.collection(COLLECTIONS.FIREWALL_RULES).getOne(ruleId);
      
      // Rimuovi dal router
      await apiCall('/router/firewall-rules', 'DELETE', {
        router: {
          ip: router.ip,
          username: router.username,
          password: router.password,
          port: router.port,
          connectionMethod: router.connectionMethod
        },
        action: 'delete',
        data: {
          id: record.id,
          chain: record.chain
        }
      });
      
      // Rimuovi da PocketBase
      await pb.collection(COLLECTIONS.FIREWALL_RULES).delete(ruleId);

      return { success: true };
    } catch (error) {
      handlePocketBaseError(error);
    }
  }
};
