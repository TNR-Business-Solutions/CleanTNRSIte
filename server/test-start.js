// Simple test to see if server can start
console.log('Testing server startup...');

try {
  // Load environment variables
  require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
  console.log('✅ dotenv loaded');
  console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? 'Set' : 'Not set');
  console.log('PORT:', process.env.PORT || '3000 (default)');
  
  // Test express
  const express = require('express');
  console.log('✅ express loaded');
  
  // Test database
  const TNRDatabase = require('../database');
  console.log('✅ database module loaded');
  
  console.log('✅ All modules loaded successfully!');
  console.log('Server should be able to start.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

