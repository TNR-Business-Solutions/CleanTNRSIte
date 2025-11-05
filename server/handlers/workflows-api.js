// Workflow Automation API
// Handles CRUD operations for automation workflows

const TNRDatabase = require('../../database');
const { parseQuery, parseBody, sendJson } = require('./http-utils');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const db = new TNRDatabase();
  await db.initialize();

  try {
    // GET - List all workflows
    if (req.method === 'GET') {
      const query = parseQuery(req);
      const activeOnly = query.activeOnly === 'true';
      const workflows = await db.getWorkflows(activeOnly);

      sendJson(res, 200, {
        success: true,
        workflows: workflows
      });
      return;
    }

    // POST - Create or update workflow
    if (req.method === 'POST') {
      const workflowData = await parseBody(req);

      if (!workflowData.workflowName || !workflowData.workflowType) {
        sendJson(res, 400, {
          success: false,
          error: 'workflowName and workflowType are required'
        });
        return;
      }

      const workflow = await db.saveWorkflow(workflowData);

      sendJson(res, 200, {
        success: true,
        workflow: workflow,
        message: workflowData.id ? 'Workflow updated successfully' : 'Workflow created successfully'
      });
      return;
    }

    // PUT - Update workflow status
    if (req.method === 'PUT') {
      const body = await parseBody(req);
      const { workflowId, isActive } = body;

      if (!workflowId || typeof isActive !== 'boolean') {
        sendJson(res, 400, {
          success: false,
          error: 'workflowId and isActive (boolean) are required'
        });
        return;
      }

      await db.updateWorkflowStatus(workflowId, isActive);

      sendJson(res, 200, {
        success: true,
        message: `Workflow ${isActive ? 'activated' : 'deactivated'} successfully`
      });
      return;
    }

    // DELETE - Remove workflow
    if (req.method === 'DELETE') {
      const query = parseQuery(req);
      const { workflowId } = query;

      if (!workflowId) {
        sendJson(res, 400, {
          success: false,
          error: 'workflowId is required'
        });
        return;
      }

      await db.deleteWorkflow(workflowId);

      sendJson(res, 200, {
        success: true,
        message: 'Workflow deleted successfully'
      });
      return;
    }

    sendJson(res, 405, {
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Workflow API error:', error);
    sendJson(res, 500, {
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

