/**
 * Content Library API
 * Manages centralized content library for reuse across all modules
 */

const TNRDatabase = require('../../database');
const { setCorsHeaders, handleCorsPreflight } = require('./cors-utils');
const { sendErrorResponse, handleUnexpectedError, ERROR_CODES } = require('./error-handler');

let dbInstance = null;

async function getDatabase() {
  if (!dbInstance) {
    dbInstance = new TNRDatabase();
    await dbInstance.initialize();
    await ensureContentLibraryTable();
  }
  return dbInstance;
}

async function ensureContentLibraryTable() {
  const db = await getDatabase();
  await db.query(`
    CREATE TABLE IF NOT EXISTS content_library (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      platforms TEXT,
      content TEXT NOT NULL,
      tags TEXT,
      notes TEXT,
      is_template INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      usage_count INTEGER DEFAULT 0
    )
  `);
  
  // Create indexes
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_content_category ON content_library(category)
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_content_created_at ON content_library(created_at)
  `);
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || req.headers.referer;
  if (handleCorsPreflight(req, res)) {
    return;
  }
  setCorsHeaders(res, origin);

  try {
    const db = await getDatabase();
    const method = req.method;
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(p => p);
    const contentId = pathParts[pathParts.length - 1] && pathParts[pathParts.length - 1] !== 'content-library' 
      ? pathParts[pathParts.length - 1] 
      : null;

    // GET - List all content or get specific content
    if (method === 'GET') {
      if (contentId) {
        // Get specific content item
        const result = await db.query('SELECT * FROM content_library WHERE id = ?', [contentId]);
        if (result && result.length > 0) {
          const item = result[0];
          return res.status(200).json({
            success: true,
            data: {
              id: item.id,
              title: item.title,
              category: item.category,
              platforms: item.platforms ? JSON.parse(item.platforms) : [],
              content: item.content,
              tags: item.tags ? JSON.parse(item.tags) : [],
              notes: item.notes,
              isTemplate: item.is_template === 1,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
              createdBy: item.created_by,
              usageCount: item.usage_count || 0
            }
          });
        } else {
          return sendErrorResponse(res, ERROR_CODES.NOT_FOUND, 'Content not found');
        }
      } else {
        // List all content
        const query = url.searchParams.get('q') || '';
        const category = url.searchParams.get('category');
        const platform = url.searchParams.get('platform');
        const isTemplate = url.searchParams.get('isTemplate');
        
        let sql = 'SELECT * FROM content_library WHERE 1=1';
        const params = [];
        
        if (query) {
          sql += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)';
          const searchTerm = `%${query}%`;
          params.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (category) {
          sql += ' AND category = ?';
          params.push(category);
        }
        
        if (platform) {
          sql += ' AND platforms LIKE ?';
          params.push(`%"${platform}"%`);
        }
        
        if (isTemplate !== null) {
          sql += ' AND is_template = ?';
          params.push(isTemplate === 'true' ? 1 : 0);
        }
        
        sql += ' ORDER BY created_at DESC';
        
        const result = await db.query(sql, params);
        const items = (result || []).map(item => ({
          id: item.id,
          title: item.title,
          category: item.category,
          platforms: item.platforms ? JSON.parse(item.platforms) : [],
          content: item.content,
          tags: item.tags ? JSON.parse(item.tags) : [],
          notes: item.notes,
          isTemplate: item.is_template === 1,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          createdBy: item.created_by,
          usageCount: item.usage_count || 0
        }));
        
        return res.status(200).json({
          success: true,
          data: items
        });
      }
    }

    // POST - Create or update content
    if (method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const contentData = JSON.parse(body);
          
          // Validate required fields
          if (!contentData.title || !contentData.content || !contentData.category) {
            return sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Title, content, and category are required');
          }
          
          const id = contentData.id || `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const isUpdate = !!contentData.id;
          
          if (isUpdate) {
            // Update existing content
            await db.query(`
              UPDATE content_library 
              SET title = ?, category = ?, platforms = ?, content = ?, tags = ?, notes = ?, is_template = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `, [
              contentData.title,
              contentData.category,
              JSON.stringify(contentData.platforms || []),
              contentData.content,
              JSON.stringify(contentData.tags || []),
              contentData.notes || '',
              contentData.isTemplate ? 1 : 0,
              id
            ]);
          } else {
            // Create new content
            await db.query(`
              INSERT INTO content_library (id, title, category, platforms, content, tags, notes, is_template, created_by)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              id,
              contentData.title,
              contentData.category,
              JSON.stringify(contentData.platforms || []),
              contentData.content,
              JSON.stringify(contentData.tags || []),
              contentData.notes || '',
              contentData.isTemplate ? 1 : 0,
              contentData.createdBy || 'system'
            ]);
          }
          
          return res.status(200).json({
            success: true,
            message: isUpdate ? 'Content updated successfully' : 'Content created successfully',
            data: { id }
          });
        } catch (error) {
          return handleUnexpectedError(res, error, 'Content Library API');
        }
      });
      return;
    }

    // DELETE - Delete content
    if (method === 'DELETE') {
      if (!contentId) {
        return sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Content ID is required');
      }
      
      await db.query('DELETE FROM content_library WHERE id = ?', [contentId]);
      
      return res.status(200).json({
        success: true,
        message: 'Content deleted successfully'
      });
    }

    // PUT - Increment usage count
    if (method === 'PUT' && contentId) {
      await db.query('UPDATE content_library SET usage_count = usage_count + 1 WHERE id = ?', [contentId]);
      
      return res.status(200).json({
        success: true,
        message: 'Usage count updated'
      });
    }

    return sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Method not allowed');
    
  } catch (error) {
    return handleUnexpectedError(res, error, 'Content Library API');
  }
};

