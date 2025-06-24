
import axios from 'axios';

// Mock data for demonstration
const mockRouters = [
  {
    id: 1,
    name: 'Office Main Router',
    ip: '192.168.1.1',
    username: 'admin',
    password: 'password',
    port: 8728,
    connectionMethod: 'API_REST',
    isMaster: true,
  },
  {
    id: 2,
    name: 'Branch Router 1',
    ip: '192.168.2.1',
    username: 'admin',
    password: 'password',
    port: 8728,
    connectionMethod: 'API_REST',
    isMaster: false,
  }
];

export const routerAPI = {
  testConnection: async (router) => {
    // Simulate connection test
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.3; // 70% success rate for demo
        resolve({
          success,
          status: success ? 'online' : 'offline',
          message: success ? 'Connessione riuscita' : 'Impossibile connettersi al router',
          latency: success ? Math.floor(Math.random() * 100) + 10 : null,
        });
      }, 2000);
    });
  },

  getRouterInfo: async (router) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          identity: router.name,
          version: '7.8',
          architecture: 'x86_64',
          uptime: '2w1d12h30m',
          cpu: Math.floor(Math.random() * 20) + 5,
          memory: Math.floor(Math.random() * 30) + 20,
        });
      }, 1000);
    });
  },

  fetchAddressLists: async (router) => {
    // Mock address lists data
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = [
          {
            id: 1,
            list: 'blocked_ips',
            address: '192.168.1.100',
            comment: 'Blocked suspicious IP',
            timeout: '1d',
          },
          {
            id: 2,
            list: 'allowed_ips',
            address: '10.0.0.0/8',
            comment: 'Internal network',
            timeout: '',
          },
          {
            id: 3,
            list: 'blocked_ips',
            address: '185.244.25.0/24',
            comment: 'Spam network',
            timeout: '',
          }
        ];
        resolve(mockData);
      }, 1500);
    });
  },

  fetchFirewallRules: async (router) => {
    // Mock firewall rules data
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = [
          {
            id: 1,
            chain: 'input',
            action: 'accept',
            srcAddress: '192.168.1.0/24',
            dstPort: '22',
            protocol: 'tcp',
            comment: 'Allow SSH from LAN',
            disabled: false,
          },
          {
            id: 2,
            chain: 'input',
            action: 'drop',
            srcAddressList: 'blocked_ips',
            comment: 'Drop blocked IPs',
            disabled: false,
          },
          {
            id: 3,
            chain: 'forward',
            action: 'accept',
            connectionState: 'established,related',
            comment: 'Allow established connections',
            disabled: false,
          }
        ];
        resolve(mockData);
      }, 1500);
    });
  },

  createAddressList: async (router, addressList) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...addressList, id: Date.now() });
      }, 1000);
    });
  },

  updateAddressList: async (router, addressList) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(addressList);
      }, 1000);
    });
  },

  deleteAddressList: async (router, addressListId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  },

  createFirewallRule: async (router, rule) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...rule, id: Date.now() });
      }, 1000);
    });
  },

  updateFirewallRule: async (router, rule) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(rule);
      }, 1000);
    });
  },

  deleteFirewallRule: async (router, ruleId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  },
};
