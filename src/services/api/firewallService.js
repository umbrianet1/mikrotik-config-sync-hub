
import { apiCall } from './httpClient';
import { pb, COLLECTIONS, handlePocketBaseError } from '../pocketbase';

export const firewallService = {
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
