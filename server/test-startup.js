console.log('=== Starting server test ===');

try {
  console.log('1. Loading auth-wix...');
  const authWix = require('./handlers/auth-wix');
  console.log('   ✓ auth-wix loaded');
  
  console.log('2. Loading auth-wix-callback...');
  const authWixCallback = require('./handlers/auth-wix-callback');
  console.log('   ✓ auth-wix-callback loaded');
  
  console.log('3. Loading wix-api-routes...');
  const wixApiRoutes = require('./handlers/wix-api-routes');
  console.log('   ✓ wix-api-routes loaded');
  
  console.log('4. Loading express...');
  const express = require('express');
  console.log('   ✓ express loaded');
  
  console.log('\n✅ All modules loaded successfully!');
  console.log('Server should start without issues.');
  
} catch (error) {
  console.error('\n❌ Error loading modules:');
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}

