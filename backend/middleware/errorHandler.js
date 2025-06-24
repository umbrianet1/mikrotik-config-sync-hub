
/**
 * Global error handling middleware
 */
function errorHandler(error, req, res, next) {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Connection refused',
      message: 'Unable to connect to the router. Please check the IP address and ensure SSH is enabled.',
      details: error.message
    });
  }

  if (error.code === 'ENOTFOUND') {
    return res.status(404).json({
      error: 'Host not found',
      message: 'The specified router IP address could not be resolved.',
      details: error.message
    });
  }

  if (error.code === 'ETIMEDOUT') {
    return res.status(408).json({
      error: 'Connection timeout',
      message: 'Connection to the router timed out. Please check the network connectivity.',
      details: error.message
    });
  }

  if (error.message && error.message.includes('Authentication')) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid username or password for the router.',
      details: error.message
    });
  }

  // Generic server error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
}

module.exports = {
  errorHandler
};
