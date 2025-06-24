
import { connectionService } from './api/connectionService';
import { addressListService } from './api/addressListService';
import { firewallService } from './api/firewallService';

export const routerAPI = {
  // Connection operations
  testConnection: connectionService.testConnection,
  getRouterInfo: connectionService.getRouterInfo,

  // Address List operations
  fetchAddressLists: addressListService.fetchAddressLists,
  createAddressList: addressListService.createAddressList,
  updateAddressList: addressListService.updateAddressList,
  deleteAddressList: addressListService.deleteAddressList,

  // Firewall operations
  fetchFirewallRules: firewallService.fetchFirewallRules,
  createFirewallRule: firewallService.createFirewallRule,
  updateFirewallRule: firewallService.updateFirewallRule,
  deleteFirewallRule: firewallService.deleteFirewallRule
};
