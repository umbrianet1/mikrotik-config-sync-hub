
/**
 * Parse RouterOS command output into JavaScript objects
 * RouterOS outputs data in a specific format that needs parsing
 */
function parseRouterOSOutput(output) {
  if (!output || typeof output !== 'string') {
    return [];
  }

  const lines = output.trim().split('\n');
  const results = [];
  let currentItem = {};
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and headers
    if (!trimmedLine || trimmedLine.startsWith('Flags:') || trimmedLine.match(/^[#\s]*$/)) {
      continue;
    }
    
    // Check if this is a new item (starts with a number or specific pattern)
    if (trimmedLine.match(/^\s*\d+/) || (Object.keys(currentItem).length > 0 && trimmedLine.includes('='))) {
      // If we have a current item, save it
      if (Object.keys(currentItem).length > 0) {
        results.push(currentItem);
        currentItem = {};
      }
    }
    
    // Parse key-value pairs
    const pairs = trimmedLine.split(/\s+/);
    for (const pair of pairs) {
      if (pair.includes('=')) {
        const [key, ...valueParts] = pair.split('=');
        const value = valueParts.join('=');
        
        if (key && value !== undefined) {
          // Clean up the key and value
          const cleanKey = key.trim();
          const cleanValue = value.replace(/^["']|["']$/g, '').trim();
          
          if (cleanKey) {
            currentItem[cleanKey] = cleanValue;
          }
        }
      } else if (pair.trim() && !pair.match(/^\d+$/)) {
        // Handle flags or single values
        const cleanPair = pair.trim();
        if (cleanPair.length > 0) {
          currentItem[cleanPair] = true;
        }
      }
    }
  }
  
  // Don't forget the last item
  if (Object.keys(currentItem).length > 0) {
    results.push(currentItem);
  }
  
  return results;
}

/**
 * Format data for RouterOS commands
 */
function formatForRouterOS(data) {
  const formatted = [];
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'boolean') {
        formatted.push(`${key}=${value ? 'yes' : 'no'}`);
      } else if (typeof value === 'string' && value.includes(' ')) {
        formatted.push(`${key}="${value}"`);
      } else {
        formatted.push(`${key}=${value}`);
      }
    }
  }
  
  return formatted.join(' ');
}

module.exports = {
  parseRouterOSOutput,
  formatForRouterOS
};
