/**
 * @fileoverview Settings API Handler
 * @module server/handlers/settings-api
 * 
 * Handles GET and POST requests for system settings
 */

const TNRDatabase = require('../../database');
const httpUtils = require('./http-utils');
const { setCorsHeaders, handleCorsPreflight } = require('./cors-utils');

// Initialize database connection
let dbInstance = null;

async function getDatabase() {
    if (!dbInstance) {
        dbInstance = new TNRDatabase();
        await dbInstance.initialize();
    }
    return dbInstance;
}

async function handleSettingsAPI(req, res) {
    const method = req.method;
    
    // Handle CORS
    const origin = req.headers.origin || req.headers.referer;
    if (handleCorsPreflight(req, res)) {
        return;
    }
    setCorsHeaders(res, origin);
    
    try {
        
        if (method === 'GET') {
            // Get settings
            const settings = await getSettings();
            httpUtils.sendJson(res, 200, {
                success: true,
                settings: settings
            });
        } else if (method === 'POST') {
            // Save settings
            const body = await httpUtils.parseBody(req);
            const result = await saveSettings(body);
            httpUtils.sendJson(res, 200, {
                success: true,
                message: 'Settings saved successfully',
                settings: result
            });
        } else {
            httpUtils.sendJson(res, 405, {
                success: false,
                error: 'Method not allowed'
            });
        }
    } catch (error) {
        console.error('Settings API Error:', error);
        httpUtils.sendJson(res, 500, {
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

async function getSettings() {
    try {
        const db = await getDatabase();
        const result = await db.query('SELECT * FROM settings ORDER BY id DESC LIMIT 1');
        
        if (result && result.length > 0) {
            return {
                businessName: result[0].business_name || 'TNR Business Solutions',
                businessEmail: result[0].business_email || 'roy.turner@tnrbusinesssolutions.com',
                businessPhone: result[0].business_phone || '(412) 499-2987',
                businessAddress: result[0].business_address || '418 Concord Avenue, Greensburg, PA 15601'
            };
        }
        
        // Return defaults if no settings in database
        return {
            businessName: 'TNR Business Solutions',
            businessEmail: 'roy.turner@tnrbusinesssolutions.com',
            businessPhone: '(412) 499-2987',
            businessAddress: '418 Concord Avenue, Greensburg, PA 15601'
        };
    } catch (error) {
        console.error('Error getting settings:', error);
        // Return defaults on error
        return {
            businessName: 'TNR Business Solutions',
            businessEmail: 'roy.turner@tnrbusinesssolutions.com',
            businessPhone: '(412) 499-2987',
            businessAddress: '418 Concord Avenue, Greensburg, PA 15601'
        };
    }
}

async function saveSettings(settingsData) {
    try {
        const db = await getDatabase();
        
        // Check if settings table exists, create if not
        await db.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                business_name TEXT,
                business_email TEXT,
                business_phone TEXT,
                business_address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Check if settings exist
        const existing = await db.query('SELECT * FROM settings ORDER BY id DESC LIMIT 1');
        
        if (existing && existing.length > 0) {
            // Update existing
            await db.query(`
                UPDATE settings 
                SET business_name = ?, 
                    business_email = ?, 
                    business_phone = ?, 
                    business_address = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [
                settingsData.businessName || '',
                settingsData.businessEmail || '',
                settingsData.businessPhone || '',
                settingsData.businessAddress || '',
                existing[0].id
            ]);
        } else {
            // Insert new
            await db.query(`
                INSERT INTO settings (business_name, business_email, business_phone, business_address)
                VALUES (?, ?, ?, ?)
            `, [
                settingsData.businessName || '',
                settingsData.businessEmail || '',
                settingsData.businessPhone || '',
                settingsData.businessAddress || ''
            ]);
        }
        
        return {
            businessName: settingsData.businessName || 'TNR Business Solutions',
            businessEmail: settingsData.businessEmail || 'roy.turner@tnrbusinesssolutions.com',
            businessPhone: settingsData.businessPhone || '(412) 499-2987',
            businessAddress: settingsData.businessAddress || '418 Concord Avenue, Greensburg, PA 15601'
        };
    } catch (error) {
        console.error('Error saving settings:', error);
        throw error;
    }
}

module.exports = handleSettingsAPI;

