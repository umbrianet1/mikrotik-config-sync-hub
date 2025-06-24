
const { validateRouterConfig } = require('../utils/validators');

/**
 * Middleware to validate router configuration
 */
function validateRouterConfig(req, res, next) {
  const { router } = req.body;
  
  if (!router) {
    return res.status(400).json({
      error: 'Router configuration is required',
      details: 'Missing router object in request body'
    });
  }
  
  const validation = validateRouterConfig(router);
  
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Invalid router configuration',
      details: validation.errors
    });
  }
  
  next();
}

/**
 * Middleware to validate request body structure
 */
function validateRequestBody(requiredFields = []) {
  return (req, res, next) => {
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: `Required fields: ${missingFields.join(', ')}`
      });
    }
    
    next();
  };
}

module.exports = {
  validateRouterConfig,
  validateRequestBody
};
