
/**
 * Validate IP address format
 */
function validateIPAddress(ip) {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Validate port number
 */
function validatePort(port) {
  const portNum = parseInt(port);
  return portNum >= 1 && portNum <= 65535;
}

/**
 * Validate router configuration
 */
function validateRouterConfig(config) {
  const errors = [];
  
  if (!config.ip) {
    errors.push('IP address is required');
  } else if (!validateIPAddress(config.ip)) {
    errors.push('Invalid IP address format');
  }
  
  if (!config.username) {
    errors.push('Username is required');
  }
  
  if (!config.password) {
    errors.push('Password is required');
  }
  
  if (config.port && !validatePort(config.port)) {
    errors.push('Invalid port number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize input to prevent command injection
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  // Remove dangerous characters that could be used for command injection
  return input.replace(/[;&|`$(){}[\]\\]/g, '');
}

module.exports = {
  validateIPAddress,
  validatePort,
  validateRouterConfig,
  sanitizeInput
};
