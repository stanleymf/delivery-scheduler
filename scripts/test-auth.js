#!/usr/bin/env node

/**
 * Simple authentication test script
 * Tests the authentication system with default credentials
 */

const { AUTH_CONFIG } = require('../src/config/auth.ts');

console.log('🔐 Testing Authentication System\n');

console.log('📋 Configuration:');
console.log(`- Admin Username: ${AUTH_CONFIG.ADMIN_USERNAME}`);
console.log(`- Admin Password: ${AUTH_CONFIG.ADMIN_PASSWORD ? '***' : 'Not set'}`);
console.log(`- Session Timeout: ${AUTH_CONFIG.SESSION_TIMEOUT / (1000 * 60 * 60)} hours`);
console.log(`- Token Key: ${AUTH_CONFIG.TOKEN_KEY}`);
console.log(`- User Key: ${AUTH_CONFIG.USER_KEY}\n`);

// Test credential validation
const testUsername = 'admin';
const testPassword = 'admin123';

console.log('🧪 Testing Credentials:');
console.log(`- Test Username: ${testUsername}`);
console.log(`- Test Password: ${testPassword}`);

const isValidCredentials = testUsername === AUTH_CONFIG.ADMIN_USERNAME && 
                          testPassword === AUTH_CONFIG.ADMIN_PASSWORD;

console.log(`- Credentials Valid: ${isValidCredentials ? '✅' : '❌'}\n`);

// Test session management
console.log('⏰ Testing Session Management:');
const testTimestamp = Date.now();
const testSessionExpired = (Date.now() - testTimestamp) > AUTH_CONFIG.SESSION_TIMEOUT;
console.log(`- Session Expired: ${testSessionExpired ? '✅' : '❌'}\n`);

console.log('🎯 Authentication System Test Complete!');
console.log('\n📝 Next Steps:');
console.log('1. Start the development server: npm run dev');
console.log('2. Navigate to http://localhost:4321');
console.log('3. You should see the login form');
console.log('4. Use the default credentials to log in');
console.log('5. Test the logout functionality'); 