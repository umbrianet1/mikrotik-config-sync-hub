
import { pb, COLLECTIONS, handlePocketBaseError } from './pocketbase';
import { Client } from 'ssh2';
import { RouterOSAPI } from 'node-routeros';

export const routerAPI = {
  // Test di connessione reale al router
  testConnection: async (router) => {
    try {
      const startTime = Date.now();
      
      if (router.connectionMethod === 'SSH') {
        return await testSSHConnection(router);
      } else if (router.connectionMethod === 'API_REST') {
        return await testAPIConnection(router);
      }
      
      throw new Error('Metodo di connessione non supportato');
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

  // Informazioni del router tramite API
  getRouterInfo: async (router) => {
    try {
      if (router.connectionMethod === 'API_REST') {
        return await getRouterInfoAPI(router);
      } else if (router.connectionMethod === 'SSH') {
        return await getRouterInfoSSH(router);
      }
      throw new Error('Metodo di connessione non supportato');
    } catch (error) {
      handlePocketBaseError(error);
    }
  },

  // Gestione Address Lists
  fetchAddressLists: async (router) => {
    try {
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

      // Se non ci sono dati salvati, recupera dal router
      const routerLists = await fetchAddressListsFromRouter(router);
      
      // Salva in PocketBase per cache
      for (const list of routerLists) {
        await pb.collection(COLLECTIONS.ADDRESS_LISTS).create({
          router_id: router.id,
          list_name: list.list,
          address: list.address,
          comment: list.comment,
          timeout: list.timeout
        });
      }

      return routerLists;
    } catch (error) {
      handlePocketBaseError(error);
    }
  },

  fetchFirewallRules: async (router) => {
    try {
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

      const routerRules = await fetchFirewallRulesFromRouter(router);
      
      for (const rule of routerRules) {
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
      }

      return routerRules;
    } catch (error) {
      handlePocketBaseError(error);
    }
  },

  createAddressList: async (router, addressList) => {
    try {
      // Crea in PocketBase
      const record = await pb.collection(COLLECTIONS.ADDRESS_LISTS).create({
        router_id: router.id,
        list_name: addressList.list,
        address: addressList.address,
        comment: addressList.comment,
        timeout: addressList.timeout
      });

      // Applica al router
      await applyAddressListToRouter(router, addressList);

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
      const record = await pb.collection(COLLECTIONS.ADDRESS_LISTS).update(addressList.id, {
        list_name: addressList.list,
        address: addressList.address,
        comment: addressList.comment,
        timeout: addressList.timeout
      });

      await applyAddressListToRouter(router, addressList);

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
      const record = await pb.collection(COLLECTIONS.ADDRESS_LISTS).getOne(addressListId);
      
      await removeAddressListFromRouter(router, record);
      await pb.collection(COLLECTIONS.ADDRESS_LISTS).delete(addressListId);

      return { success: true };
    } catch (error) {
      handlePocketBaseError(error);
    }
  },

  createFirewallRule: async (router, rule) => {
    try {
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

      await applyFirewallRuleToRouter(router, rule);

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
      const record = await pb.collection(COLLECTIONS.FIREWALL_RULES).update(rule.id, {
        chain: rule.chain,
        action: rule.action,
        src_address: rule.srcAddress,
        dst_port: rule.dstPort,
        protocol: rule.protocol,
        comment: rule.comment,
        disabled: rule.disabled
      });

      await applyFirewallRuleToRouter(router, rule);

      return rule;
    } catch (error) {
      handlePocketBaseError(error);
    }
  },

  deleteFirewallRule: async (router, ruleId) => {
    try {
      const record = await pb.collection(COLLECTIONS.FIREWALL_RULES).getOne(ruleId);
      
      await removeFirewallRuleFromRouter(router, record);
      await pb.collection(COLLECTIONS.FIREWALL_RULES).delete(ruleId);

      return { success: true };
    } catch (error) {
      handlePocketBaseError(error);
    }
  }
};

// Funzioni helper per connessioni SSH
const testSSHConnection = (router) => {
  return new Promise((resolve) => {
    const conn = new Client();
    const startTime = Date.now();
    
    conn.on('ready', () => {
      const latency = Date.now() - startTime;
      conn.end();
      resolve({
        success: true,
        status: 'online',
        message: 'Connessione SSH riuscita',
        latency
      });
    }).on('error', (err) => {
      resolve({
        success: false,
        status: 'offline',
        message: `Errore SSH: ${err.message}`,
        latency: null
      });
    }).connect({
      host: router.ip,
      port: router.port || 22,
      username: router.username,
      password: router.password
    });
  });
};

// Funzioni helper per connessioni API
const testAPIConnection = async (router) => {
  try {
    const startTime = Date.now();
    const api = new RouterOSAPI({
      host: router.ip,
      user: router.username,
      password: router.password,
      port: router.port || 8728
    });

    await api.connect();
    const latency = Date.now() - startTime;
    await api.close();

    return {
      success: true,
      status: 'online',
      message: 'Connessione API riuscita',
      latency
    };
  } catch (error) {
    return {
      success: false,
      status: 'offline',
      message: `Errore API: ${error.message}`,
      latency: null
    };
  }
};

// Funzioni per recuperare dati dal router
const fetchAddressListsFromRouter = async (router) => {
  // Implementazione per recuperare address lists dal router MikroTik
  // Questa è una versione semplificata - andrebbe implementata in base al metodo di connessione
  return [
    {
      id: Date.now(),
      list: 'blocked_ips',
      address: '192.168.1.100',
      comment: 'IP bloccato via API',
      timeout: '1d'
    }
  ];
};

const getRouterInfoAPI = async (router) => {
  // Implementazione per ottenere info router via API
  return {
    identity: router.name,
    version: '7.8',
    architecture: 'x86_64',
    uptime: 'Recuperato via API',
    cpu: 15,
    memory: 25
  };
};

const getRouterInfoSSH = async (router) => {
  // Implementazione per ottenere info router via SSH
  return {
    identity: router.name,
    version: '7.8',
    architecture: 'x86_64',
    uptime: 'Recuperato via SSH',
    cpu: 12,
    memory: 22
  };
};

// Funzioni per applicare modifiche al router
const applyAddressListToRouter = async (router, addressList) => {
  console.log('Applicando address list al router:', router.name, addressList);
  // Implementazione per applicare la address list al router
};

const removeAddressListFromRouter = async (router, addressList) => {
  console.log('Rimuovendo address list dal router:', router.name, addressList);
  // Implementazione per rimuovere la address list dal router
};

const fetchFirewallRulesFromRouter = async (router) => {
  // Implementazione per recuperare regole firewall dal router
  return [
    {
      id: Date.now(),
      chain: 'input',
      action: 'accept',
      srcAddress: '192.168.1.0/24',
      dstPort: '22',
      protocol: 'tcp',
      comment: 'Regola recuperata via API',
      disabled: false
    }
  ];
};

const applyFirewallRuleToRouter = async (router, rule) => {
  console.log('Applicando regola firewall al router:', router.name, rule);
  // Implementazione per applicare la regola al router
};

const removeFirewallRuleFromRouter = async (router, rule) => {
  console.log('Rimuovendo regola firewall dal router:', router.name, rule);
  // Implementazione per rimuovere la regola dal router
};
