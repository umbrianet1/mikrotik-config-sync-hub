
const sshService = require('../services/sshService');
const { parseRouterOSOutput } = require('../utils/parsers');
const { validateIPAddress } = require('../utils/validators');

class RouterController {
  async testConnection(req, res, next) {
    try {
      const { router } = req.body;
      const startTime = Date.now();
      
      console.log(`Testing connection to ${router.ip}:${router.port || 22}`);
      
      const connection = await sshService.connect(router);
      const result = await sshService.executeCommand(connection, '/system/identity/print');
      await sshService.disconnect(connection);
      
      const latency = Date.now() - startTime;
      
      res.json({
        success: true,
        status: 'online',
        message: 'Connessione riuscita',
        latency: latency,
        identity: parseRouterOSOutput(result)[0]?.name || 'Unknown'
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      res.json({
        success: false,
        status: 'offline',
        message: error.message || 'Connessione fallita',
        latency: null
      });
    }
  }

  async getRouterInfo(req, res, next) {
    try {
      const { router } = req.body;
      
      console.log(`Getting router info for ${router.ip}`);
      
      const connection = await sshService.connect(router);
      
      // Get system identity
      const identityResult = await sshService.executeCommand(connection, '/system/identity/print');
      const identity = parseRouterOSOutput(identityResult)[0];
      
      // Get system resource
      const resourceResult = await sshService.executeCommand(connection, '/system/resource/print');
      const resource = parseRouterOSOutput(resourceResult)[0];
      
      // Get RouterOS version
      const versionResult = await sshService.executeCommand(connection, '/system/package/print where name=routeros');
      const version = parseRouterOSOutput(versionResult)[0];
      
      // Get uptime
      const uptimeResult = await sshService.executeCommand(connection, '/system/resource/print');
      const uptime = parseRouterOSOutput(uptimeResult)[0]?.uptime;
      
      await sshService.disconnect(connection);
      
      res.json({
        success: true,
        data: {
          identity: identity?.name || 'Unknown',
          model: resource?.['board-name'] || 'Unknown',
          version: version?.version || resource?.version || 'Unknown',
          uptime: uptime || 'Unknown',
          cpu: resource?.cpu || 'Unknown',
          memory: {
            total: resource?.['total-memory'] || 0,
            free: resource?.['free-memory'] || 0
          },
          architecture: resource?.['architecture-name'] || 'Unknown'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAddressLists(req, res, next) {
    try {
      const { router } = req.body;
      
      console.log(`Getting address lists for ${router.ip}`);
      
      const connection = await sshService.connect(router);
      const result = await sshService.executeCommand(connection, '/ip/firewall/address-list/print');
      await sshService.disconnect(connection);
      
      const addressLists = parseRouterOSOutput(result).map(item => ({
        id: item['.id'],
        list: item.list,
        address: item.address,
        comment: item.comment || '',
        timeout: item.timeout || '',
        disabled: item.disabled === 'true'
      }));
      
      res.json(addressLists);
    } catch (error) {
      next(error);
    }
  }

  async createAddressList(req, res, next) {
    try {
      const { router, action, data } = req.body;
      
      if (action !== 'create') {
        return res.status(400).json({ error: 'Invalid action for this endpoint' });
      }
      
      console.log(`Creating address list entry for ${router.ip}:`, data);
      
      const connection = await sshService.connect(router);
      
      let command = `/ip/firewall/address-list/add list="${data.list}" address="${data.address}"`;
      if (data.comment) command += ` comment="${data.comment}"`;
      if (data.timeout) command += ` timeout="${data.timeout}"`;
      
      await sshService.executeCommand(connection, command);
      await sshService.disconnect(connection);
      
      res.json({ success: true, message: 'Address list entry created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateAddressList(req, res, next) {
    try {
      const { router, action, data } = req.body;
      
      if (action !== 'update') {
        return res.status(400).json({ error: 'Invalid action for this endpoint' });
      }
      
      console.log(`Updating address list entry for ${router.ip}:`, data);
      
      const connection = await sshService.connect(router);
      
      let command = `/ip/firewall/address-list/set ${data.id}`;
      if (data.list) command += ` list="${data.list}"`;
      if (data.address) command += ` address="${data.address}"`;
      if (data.comment !== undefined) command += ` comment="${data.comment}"`;
      if (data.timeout !== undefined) command += ` timeout="${data.timeout}"`;
      
      await sshService.executeCommand(connection, command);
      await sshService.disconnect(connection);
      
      res.json({ success: true, message: 'Address list entry updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteAddressList(req, res, next) {
    try {
      const { router, action, data } = req.body;
      
      if (action !== 'delete') {
        return res.status(400).json({ error: 'Invalid action for this endpoint' });
      }
      
      console.log(`Deleting address list entry for ${router.ip}:`, data);
      
      const connection = await sshService.connect(router);
      
      // Find the entry by list and address
      const findResult = await sshService.executeCommand(
        connection, 
        `/ip/firewall/address-list/print where list="${data.list}" and address="${data.address}"`
      );
      
      const entries = parseRouterOSOutput(findResult);
      if (entries.length === 0) {
        await sshService.disconnect(connection);
        return res.status(404).json({ error: 'Address list entry not found' });
      }
      
      const entryId = entries[0]['.id'];
      await sshService.executeCommand(connection, `/ip/firewall/address-list/remove ${entryId}`);
      await sshService.disconnect(connection);
      
      res.json({ success: true, message: 'Address list entry deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getFirewallRules(req, res, next) {
    try {
      const { router } = req.body;
      
      console.log(`Getting firewall rules for ${router.ip}`);
      
      const connection = await sshService.connect(router);
      const result = await sshService.executeCommand(connection, '/ip/firewall/filter/print');
      await sshService.disconnect(connection);
      
      const firewallRules = parseRouterOSOutput(result).map(item => ({
        id: item['.id'],
        chain: item.chain,
        action: item.action,
        srcAddress: item['src-address'] || '',
        dstPort: item['dst-port'] || '',
        protocol: item.protocol || '',
        comment: item.comment || '',
        disabled: item.disabled === 'true'
      }));
      
      res.json(firewallRules);
    } catch (error) {
      next(error);
    }
  }

  async createFirewallRule(req, res, next) {
    try {
      const { router, action, data } = req.body;
      
      if (action !== 'create') {
        return res.status(400).json({ error: 'Invalid action for this endpoint' });
      }
      
      console.log(`Creating firewall rule for ${router.ip}:`, data);
      
      const connection = await sshService.connect(router);
      
      let command = `/ip/firewall/filter/add chain="${data.chain}" action="${data.action}"`;
      if (data.srcAddress) command += ` src-address="${data.srcAddress}"`;
      if (data.dstPort) command += ` dst-port="${data.dstPort}"`;
      if (data.protocol) command += ` protocol="${data.protocol}"`;
      if (data.comment) command += ` comment="${data.comment}"`;
      if (data.disabled) command += ` disabled=yes`;
      
      await sshService.executeCommand(connection, command);
      await sshService.disconnect(connection);
      
      res.json({ success: true, message: 'Firewall rule created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateFirewallRule(req, res, next) {
    try {
      const { router, action, data } = req.body;
      
      if (action !== 'update') {
        return res.status(400).json({ error: 'Invalid action for this endpoint' });
      }
      
      console.log(`Updating firewall rule for ${router.ip}:`, data);
      
      const connection = await sshService.connect(router);
      
      let command = `/ip/firewall/filter/set ${data.id}`;
      if (data.chain) command += ` chain="${data.chain}"`;
      if (data.action) command += ` action="${data.action}"`;
      if (data.srcAddress !== undefined) command += ` src-address="${data.srcAddress}"`;
      if (data.dstPort !== undefined) command += ` dst-port="${data.dstPort}"`;
      if (data.protocol !== undefined) command += ` protocol="${data.protocol}"`;
      if (data.comment !== undefined) command += ` comment="${data.comment}"`;
      if (data.disabled !== undefined) command += ` disabled=${data.disabled ? 'yes' : 'no'}`;
      
      await sshService.executeCommand(connection, command);
      await sshService.disconnect(connection);
      
      res.json({ success: true, message: 'Firewall rule updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteFirewallRule(req, res, next) {
    try {
      const { router, action, data } = req.body;
      
      if (action !== 'delete') {
        return res.status(400).json({ error: 'Invalid action for this endpoint' });
      }
      
      console.log(`Deleting firewall rule for ${router.ip}:`, data);
      
      const connection = await sshService.connect(router);
      await sshService.executeCommand(connection, `/ip/firewall/filter/remove ${data.id}`);
      await sshService.disconnect(connection);
      
      res.json({ success: true, message: 'Firewall rule deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RouterController();
