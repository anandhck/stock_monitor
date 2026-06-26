const crypto = require('crypto');

/**
 * Generates a secure, random API key.
 * @param {string} prefix - An optional prefix for the key (e.g., 'sk_live').
 * @param {number} bytes - The number of random bytes to generate (default 32 = 64 hex chars).
 * @returns {string} The generated API key.
 */
function createApiKey(prefix = 'api', bytes = 32) {
    // Generate secure random bytes and convert to a hex string
    const token = crypto.randomBytes(bytes).toString('hex');
    
    // Return the formatted API key
    return `${prefix}_${token}`;
}

// --- Example Usage ---

// Standard key (e.g., api_7f3b8a...)
const defaultKey = createApiKey();
console.log('Default Key:', defaultKey);

// Custom prefixed key (e.g., sk_live_a1b2c3...)
const secretKey = createApiKey('sk_live');
console.log('Secret Key: ', secretKey);