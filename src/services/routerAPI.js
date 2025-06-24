
import { pb, COLLECTIONS, handlePocketBaseError } from './pocketbase';

export const routerAPI = {
  // Test di connessione simulato (per frontend)
  testConnection: async (router) => {
    try {
      console.log('Testing connection to router:', router.name, router.ip);
      const startTime = Date.now();
      
      // Simula una connessione con un piccolo delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const latency = Date.now() - startTime;
      const isReachable = Math.random() > 0.3; // 70% di successo per il test
      
      if (isReachable) {
        return {
          success: true,
          status: 'online',
          message: `Connessione ${router.connectionMethod} simulata riuscita`,
          latency
        };
      } else {
        return {
          success: false,
          status: 'offline',
          message: 'Router non raggiungibile (simulazione)',
          latency: null
        };
      }
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

  // Informazioni del router simulate
  getRouterInfo: async (router) => {
    try {
      console.log('Getting router info for:', router.name);
      
      // Simula ritardo di rete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        identity: router.name,
        version: '7.8.2',
        architecture: 'x86_64',
        uptime: `${Math.floor(Math.random() * 30)}d ${Math.floor(Math.random() * 24)}h`,
        cpu: Math.floor(Math.random() * 50) + 10,
        memory: Math.floor(Math.random() * 40) + 20,
        connectionMethod: router.connectionMethod
      };
    } catch (error) {
      handlePocketBaseError(error);
    }
  },

  // Gestione Address Lists
  fetchAddressLists: async (router) => {
    try {
      console.log('Fetching address lists for router:', router.id);
      
      // Prima controlla se ci sono dati salvati in PocketBase
      const savedLists = await pb.collection(COLLECTIONS.ADDRESS_LISTS)
        .getList(1, 50, {
          filter: `router_id = "${router.id}"`
        });

      if (savedLists.items.length > 0) {
        return savedLists.items.map(item => ({
          id: item.id,
          list: item.list_name,
          address: item.address,
          comment: item.comment,
          timeout: item.timeout
        }));
      }

      // Se non ci sono dati salvati, crea alcuni dati di esempio
      const exampleLists = [
        {
          id: `temp_${Date.now()}_1`,
          list: 'blocked_ips',
          address: '192.168.1.100',
          comment: 'IP bloccato automaticamente',
          timeout: '1d'
        },
        {
          id: `temp_${Date.now()}_2`,
          list: 'whitelist',
          address: '192.168.1.0/24',
          comment: 'Rete locale sicura',
          timeout: ''
        }
      ];
      
      // Salva gli esempi in PocketBase per la cache
      for (const list of exampleLists) {
        try {
          await pb.collection(COLLECTIONS.ADDRESS_LISTS).create({
            router_id: router.id,
            list_name: list.list,
            address: list.address,
            comment: list.comment,
            timeout: list.timeout
          });
        } catch (error) {
          console.warn('Could not save example address list:', error);
        }
      }

      return exampleLists;
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

      if (savedRules.items.length > 0) {
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
      }

      // Crea regole di esempio
      const exampleRules = [
        {
          id: `temp_${Date.now()}_1`,
          chain: 'input',
          action: 'accept',
          srcAddress: '192.168.1.0/24',
          dstPort: '22',
          protocol: 'tcp',
          comment: 'SSH dalla rete locale',
          disabled: false
        },
        {
          id: `temp_${Date.now()}_2`,
          chain: 'forward',
          action: 'drop',
          srcAddress: '0.0.0.0/0',
          dstPort: '23',
          protocol: 'tcp',
          comment: 'Blocca Telnet',
          disabled: false
        }
      ];
      
      // Salva le regole di esempio
      for (const rule of exampleRules) {
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
          console.warn('Could not save example firewall rule:', error);
        }
      }

      return exampleRules;
    } catch (error) {
      handlePocketBaseError(error);
    }
  },

  createAddressList: async (router, addressList) => {
    try {
      console.log('Creating address list:', addressList);
      
      // Crea in PocketBase
      const record = await pb.collection(COLLECTIONS.ADDRESS_LISTS).create({
        router_id: router.id,
        list_name: addressList.list,
        address: addressList.address,
        comment: addressList.comment,
        timeout: addressList.timeout
      });

      // Log simulazione applicazione al router
      console.log('Simulando applicazione address list al router:', router.name, addressList);

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
      
      const record = await pb.collection(COLLECTIONS.ADDRESS_LISTS).update(addressList.id, {
        list_name: addressList.list,
        address: addressList.address,
        comment: addressList.comment,
        timeout: addressList.timeout
      });

      console.log('Simulando aggiornamento address list sul router:', router.name, addressList);

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
      
      console.log('Simulando rimozione address list dal router:', router.name, record);
      
      await pb.collection(COLLECTIONS.ADDRESS_LISTS).delete(addressListId);

      return { success: true };
    } catch (error) {
      handlePocketBaseError(error);
    }
  },

  createFirewallRule: async (router, rule) => {
    try {
      console.log('Creating firewall rule:', rule);
      
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

      console.log('Simulando applicazione regola firewall al router:', router.name, rule);

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
      
      const record = await pb.collection(COLLECTIONS.FIREWALL_RULES).update(rule.id, {
        chain: rule.chain,
        action: rule.action,
        src_address: rule.srcAddress,
        dst_port: rule.dstPort,
        protocol: rule.protocol,
        comment: rule.comment,
        disabled: rule.disabled
      });

      console.log('Simulando aggiornamento regola firewall sul router:', router.name, rule);

      return rule;
    } catch (error) {
      handlePocketBaseError(error);
    }
  },

  deleteFirewallRule: async (router, ruleId) => {
    try {
      console.log('Deleting firewall rule:', ruleId);
      
      const record = await pb.collection(COLLECTIONS.FIREWALL_RULES).getOne(ruleId);
      
      console.log('Simulando rimozione regola firewall dal router:', router.name, record);
      
      await pb.collection(COLLECTIONS.FIREWALL_RULES).delete(ruleId);

      return { success: true };
    } catch (error) {
      handlePocketBaseError(error);
    }
  }
};
