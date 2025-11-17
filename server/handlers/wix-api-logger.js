/**
 * Wix API Logger
 * Comprehensive logging for all Wix API operations
 * Shows exactly what is being changed and when
 */

const fs = require('fs');
const path = require('path');

// Log directory
const LOG_DIR = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Create detailed log entry
 */
function createLogEntry(operation, instanceId, details) {
  return {
    timestamp: new Date().toISOString(),
    operation,
    instanceId,
    ...details
  };
}

/**
 * Log API request
 */
function logRequest(operation, instanceId, requestData) {
  const logEntry = createLogEntry(operation, instanceId, {
    type: 'REQUEST',
    endpoint: requestData.endpoint,
    method: requestData.method,
    data: requestData.data || null,
    timestamp: new Date().toISOString()
  });
  
  console.log(`\n📤 [${logEntry.timestamp}] ${operation}`);
  console.log(`   Endpoint: ${requestData.method} ${requestData.endpoint}`);
  if (requestData.data) {
    console.log(`   Data:`, JSON.stringify(requestData.data, null, 2));
  }
  
  // Write to file
  const logFile = path.join(LOG_DIR, `wix-api-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  
  return logEntry;
}

/**
 * Log API response
 */
function logResponse(operation, instanceId, responseData) {
  const logEntry = createLogEntry(operation, instanceId, {
    type: 'RESPONSE',
    status: responseData.status,
    data: responseData.data || null,
    success: responseData.success,
    timestamp: new Date().toISOString()
  });
  
  if (responseData.success) {
    console.log(`✅ [${logEntry.timestamp}] ${operation} - SUCCESS`);
    if (responseData.data) {
      console.log(`   Response:`, JSON.stringify(responseData.data, null, 2));
    }
  } else {
    console.log(`❌ [${logEntry.timestamp}] ${operation} - FAILED`);
    console.log(`   Error:`, responseData.error);
  }
  
  // Write to file
  const logFile = path.join(LOG_DIR, `wix-api-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  
  return logEntry;
}

/**
 * Log change operation
 */
function logChange(operation, instanceId, changeDetails) {
  const logEntry = createLogEntry(operation, instanceId, {
    type: 'CHANGE',
    entityType: changeDetails.entityType,
    entityId: changeDetails.entityId,
    changes: changeDetails.changes,
    before: changeDetails.before || null,
    after: changeDetails.after || null,
    timestamp: new Date().toISOString()
  });
  
  console.log(`\n🔄 [${logEntry.timestamp}] CHANGE DETECTED`);
  console.log(`   Operation: ${operation}`);
  console.log(`   Entity: ${changeDetails.entityType} (${changeDetails.entityId})`);
  console.log(`   Changes:`);
  for (const [key, value] of Object.entries(changeDetails.changes)) {
    console.log(`     - ${key}: ${JSON.stringify(value)}`);
  }
  if (changeDetails.before) {
    console.log(`   Before:`, JSON.stringify(changeDetails.before, null, 2));
  }
  if (changeDetails.after) {
    console.log(`   After:`, JSON.stringify(changeDetails.after, null, 2));
  }
  
  // Write to file
  const logFile = path.join(LOG_DIR, `wix-changes-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  
  return logEntry;
}

/**
 * Get today's log file path
 */
function getTodayLogFile() {
  return path.join(LOG_DIR, `wix-api-${new Date().toISOString().split('T')[0]}.log`);
}

/**
 * Get change log file path
 */
function getChangeLogFile() {
  return path.join(LOG_DIR, `wix-changes-${new Date().toISOString().split('T')[0]}.log`);
}

/**
 * Read recent logs
 */
function getRecentLogs(limit = 50) {
  const logFile = getTodayLogFile();
  if (!fs.existsSync(logFile)) {
    return [];
  }
  
  const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(l => l.trim());
  return lines.slice(-limit).map(line => JSON.parse(line));
}

/**
 * Read recent changes
 */
function getRecentChanges(limit = 50) {
  const logFile = getChangeLogFile();
  if (!fs.existsSync(logFile)) {
    return [];
  }
  
  const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(l => l.trim());
  return lines.slice(-limit).map(line => JSON.parse(line));
}

module.exports = {
  logRequest,
  logResponse,
  logChange,
  getRecentLogs,
  getRecentChanges,
  getTodayLogFile,
  getChangeLogFile
};

