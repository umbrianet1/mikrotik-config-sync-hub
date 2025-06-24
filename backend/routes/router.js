
const express = require('express');
const router = express.Router();
const routerController = require('../controllers/routerController');
const { validateRouterConfig } = require('../middleware/validation');

// Test router connection
router.post('/test-connection', validateRouterConfig, routerController.testConnection);

// Get router information
router.post('/info', validateRouterConfig, routerController.getRouterInfo);

// Address Lists management
router.post('/address-lists', validateRouterConfig, routerController.getAddressLists);
router.post('/address-lists', validateRouterConfig, routerController.createAddressList);
router.put('/address-lists', validateRouterConfig, routerController.updateAddressList);
router.delete('/address-lists', validateRouterConfig, routerController.deleteAddressList);

// Firewall Rules management
router.post('/firewall-rules', validateRouterConfig, routerController.getFirewallRules);
router.post('/firewall-rules', validateRouterConfig, routerController.createFirewallRule);
router.put('/firewall-rules', validateRouterConfig, routerController.updateFirewallRule);
router.delete('/firewall-rules', validateRouterConfig, routerController.deleteFirewallRule);

module.exports = router;
