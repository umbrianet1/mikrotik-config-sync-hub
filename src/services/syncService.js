
export const syncService = {
  compareAddressLists: (router1Lists, router2Lists) => {
    const r1Map = new Map();
    const r2Map = new Map();
    
    router1Lists.forEach(item => {
      const key = `${item.list}-${item.address}`;
      r1Map.set(key, item);
    });
    
    router2Lists.forEach(item => {
      const key = `${item.list}-${item.address}`;
      r2Map.set(key, item);
    });
    
    const onlyInRouter1 = [];
    const onlyInRouter2 = [];
    const different = [];
    const identical = [];
    
    // Check items in router1
    r1Map.forEach((item, key) => {
      if (!r2Map.has(key)) {
        onlyInRouter1.push(item);
      } else {
        const r2Item = r2Map.get(key);
        if (JSON.stringify(item) === JSON.stringify(r2Item)) {
          identical.push(item);
        } else {
          different.push({ router1: item, router2: r2Item });
        }
      }
    });
    
    // Check items only in router2
    r2Map.forEach((item, key) => {
      if (!r1Map.has(key)) {
        onlyInRouter2.push(item);
      }
    });
    
    return {
      onlyInRouter1,
      onlyInRouter2,
      different,
      identical,
      summary: {
        total1: router1Lists.length,
        total2: router2Lists.length,
        onlyIn1: onlyInRouter1.length,
        onlyIn2: onlyInRouter2.length,
        different: different.length,
        identical: identical.length,
      }
    };
  },

  compareFirewallRules: (router1Rules, router2Rules) => {
    const r1Map = new Map();
    const r2Map = new Map();
    
    router1Rules.forEach(rule => {
      const key = `${rule.chain}-${rule.action}-${rule.srcAddress || ''}-${rule.dstPort || ''}`;
      r1Map.set(key, rule);
    });
    
    router2Rules.forEach(rule => {
      const key = `${rule.chain}-${rule.action}-${rule.srcAddress || ''}-${rule.dstPort || ''}`;
      r2Map.set(key, rule);
    });
    
    const onlyInRouter1 = [];
    const onlyInRouter2 = [];
    const different = [];
    const identical = [];
    
    r1Map.forEach((rule, key) => {
      if (!r2Map.has(key)) {
        onlyInRouter1.push(rule);
      } else {
        const r2Rule = r2Map.get(key);
        if (JSON.stringify(rule) === JSON.stringify(r2Rule)) {
          identical.push(rule);
        } else {
          different.push({ router1: rule, router2: r2Rule });
        }
      }
    });
    
    r2Map.forEach((rule, key) => {
      if (!r1Map.has(key)) {
        onlyInRouter2.push(rule);
      }
    });
    
    return {
      onlyInRouter1,
      onlyInRouter2,
      different,
      identical,
      summary: {
        total1: router1Rules.length,
        total2: router2Rules.length,
        onlyIn1: onlyInRouter1.length,
        onlyIn2: onlyInRouter2.length,
        different: different.length,
        identical: identical.length,
      }
    };
  },

  generateSyncPreview: (masterData, slaveData, syncOptions) => {
    const preview = {
      addressLists: null,
      firewallRules: null,
    };
    
    if (syncOptions.addressLists && masterData.addressLists && slaveData.addressLists) {
      const comparison = syncService.compareAddressLists(
        masterData.addressLists,
        slaveData.addressLists
      );
      
      preview.addressLists = {
        toAdd: comparison.onlyInRouter1,
        toUpdate: comparison.different.map(d => d.router1),
        toDelete: comparison.onlyInRouter2,
        unchanged: comparison.identical,
      };
    }
    
    if (syncOptions.firewallRules && masterData.firewallRules && slaveData.firewallRules) {
      const comparison = syncService.compareFirewallRules(
        masterData.firewallRules,
        slaveData.firewallRules
      );
      
      preview.firewallRules = {
        toAdd: comparison.onlyInRouter1,
        toUpdate: comparison.different.map(d => d.router1),
        toDelete: comparison.onlyInRouter2,
        unchanged: comparison.identical,
      };
    }
    
    return preview;
  },

  executeSyncOperation: async (masterRouter, slaveRouter, syncOptions, preview) => {
    // Simulate sync operation
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = {
          success: true,
          addressListsResults: null,
          firewallRulesResults: null,
          errors: [],
        };
        
        if (syncOptions.addressLists && preview.addressLists) {
          results.addressListsResults = {
            added: preview.addressLists.toAdd.length,
            updated: preview.addressLists.toUpdate.length,
            deleted: preview.addressLists.toDelete.length,
          };
        }
        
        if (syncOptions.firewallRules && preview.firewallRules) {
          results.firewallRulesResults = {
            added: preview.firewallRules.toAdd.length,
            updated: preview.firewallRules.toUpdate.length,
            deleted: preview.firewallRules.toDelete.length,
          };
        }
        
        resolve(results);
      }, 3000);
    });
  },
};
