// Workflow Execution Engine
// Executes workflows when triggers fire

const TNRDatabase = require('../database');

// Simple email handler fallback if email-handler not available
let emailHandler;
try {
  emailHandler = require('../email-handler');
} catch (e) {
  console.warn('Email handler not available, using fallback');
  emailHandler = {
    sendEmail: async (data) => {
      console.log('Would send email:', data);
      return { sent: true };
    }
  };
}

class WorkflowExecutor {
  constructor() {
    this.db = null;
  }

  async initialize() {
    this.db = new TNRDatabase();
    await this.db.initialize();
  }

  // Execute a workflow's actions
  async executeWorkflow(workflow, context) {
    if (!workflow.isActive) {
      console.log(`Workflow ${workflow.workflowName} is inactive, skipping`);
      return { executed: false, reason: 'inactive' };
    }

    console.log(`Executing workflow: ${workflow.workflowName}`);
    
    const results = [];
    
    for (const action of workflow.actions || []) {
      try {
        const result = await this.executeAction(action, context);
        results.push({ action: action.type, success: true, result });
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error);
        results.push({ action: action.type, success: false, error: error.message });
      }
    }

    // Update workflow last run time
    await this.db.updateWorkflowLastRun(
      workflow.id,
      new Date().toISOString(),
      this.calculateNextRun(workflow)
    );

    return { executed: true, results };
  }

  // Execute a single action
  async executeAction(action, context) {
    const { lead, client, triggerData } = context;
    const target = lead || client;
    
    if (!target) {
      throw new Error('No lead or client provided in context');
    }

    switch (action.type) {
      case 'send_email':
        return await this.actionSendEmail(action.config, target);
      
      case 'update_status':
        return await this.actionUpdateStatus(action.config, target, lead ? 'lead' : 'client');
      
      case 'add_note':
        return await this.actionAddNote(action.config, target, lead ? 'lead' : 'client');
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Action: Send Email
  async actionSendEmail(config, target) {
    if (!target.email) {
      throw new Error('No email address available');
    }

    const subject = this.replaceVariables(config.subject || 'Automated Email', target);
    const content = this.replaceVariables(config.content || '', target);

    // Use email handler to send email
    await emailHandler.sendEmail({
      to: target.email,
      subject: subject,
      html: content,
      text: content.replace(/<[^>]*>/g, '') // Strip HTML for text version
    });

    return { sent: true, to: target.email, subject };
  }

  // Action: Update Status
  async actionUpdateStatus(config, target, type) {
    const newStatus = config.status;
    if (!newStatus) {
      throw new Error('No status specified in action config');
    }

    if (type === 'lead') {
      // Update lead status (leads don't have updateLead method, use direct SQL)
      await this.db.execute(
        `UPDATE leads SET status = ?, updatedAt = ? WHERE id = ?`,
        [newStatus, new Date().toISOString(), target.id]
      );
    } else {
      await this.db.updateClient(target.id, { status: newStatus });
    }

    return { updated: true, newStatus, targetId: target.id };
  }

  // Action: Add Note
  async actionAddNote(config, target, type) {
    const note = config.note || 'Automated note from workflow';
    const timestamp = new Date().toISOString();
    
    // Get existing notes
    const existing = type === 'lead' 
      ? await this.db.getLead(target.id)
      : await this.db.getClient(target.id);
    
    const currentNotes = existing?.notes || '';
    const newNote = `[${timestamp}] ${note}\n${currentNotes}`;

    if (type === 'lead') {
      // Leads don't have direct note update, would need to add method
      // For now, update notes field
      await this.db.execute(
        `UPDATE leads SET notes = ? WHERE id = ?`,
        [newNote, target.id]
      );
    } else {
      await this.db.updateClient(target.id, { notes: newNote });
    }

    return { added: true, note };
  }

  // Replace template variables in strings
  replaceVariables(text, target) {
    if (!text || !target) return text;
    
    return text
      .replace(/\{\{name\}\}/g, target.name || '')
      .replace(/\{\{company\}\}/g, target.company || target.businessName || '')
      .replace(/\{\{email\}\}/g, target.email || '')
      .replace(/\{\{phone\}\}/g, target.phone || '')
      .replace(/\{\{businessType\}\}/g, target.businessType || '');
  }

  // Calculate next run time for date-based workflows
  calculateNextRun(workflow) {
    if (workflow.trigger?.type !== 'date_based') {
      return null;
    }

    const days = workflow.trigger.days || 0;
    const nextRun = new Date();
    nextRun.setDate(nextRun.getDate() + days);
    return nextRun.toISOString();
  }

  // Check and execute workflows for a new lead
  async processNewLead(lead) {
    const workflows = await this.db.getWorkflows(true); // Active only
    
    const matchingWorkflows = workflows.filter(w => {
      const trigger = w.trigger || {};
      return trigger.type === 'new_lead';
    });

    for (const workflow of matchingWorkflows) {
      await this.executeWorkflow(workflow, {
        lead,
        triggerData: { type: 'new_lead' }
      });
    }

    return matchingWorkflows.length;
  }

  // Check and execute workflows for status change
  async processStatusChange(entity, oldStatus, newStatus, type) {
    const workflows = await this.db.getWorkflows(true);
    
    const matchingWorkflows = workflows.filter(w => {
      const trigger = w.trigger || {};
      if (trigger.type === 'lead_status_change' && type === 'lead') {
        const fromStatus = trigger.fromStatus || '';
        const toStatus = trigger.toStatus || '';
        return (!fromStatus || fromStatus === oldStatus) && 
               (!toStatus || toStatus === newStatus);
      }
      if (trigger.type === 'client_status_change' && type === 'client') {
        const fromStatus = trigger.fromStatus || '';
        const toStatus = trigger.toStatus || '';
        return (!fromStatus || fromStatus === oldStatus) && 
               (!toStatus || toStatus === newStatus);
      }
      return false;
    });

    for (const workflow of matchingWorkflows) {
      await this.executeWorkflow(workflow, {
        lead: type === 'lead' ? entity : null,
        client: type === 'client' ? entity : null,
        triggerData: { type: 'status_change', oldStatus, newStatus }
      });
    }

    return matchingWorkflows.length;
  }

  // Check date-based workflows (should be called periodically)
  async processDateBasedWorkflows() {
    const workflows = await this.db.getWorkflows(true);
    
    const dateBasedWorkflows = workflows.filter(w => {
      const trigger = w.trigger || {};
      return trigger.type === 'date_based';
    });

    let executed = 0;
    
    for (const workflow of dateBasedWorkflows) {
      const trigger = workflow.trigger;
      const days = trigger.days || 0;
      const dateField = trigger.dateField || 'createdAt';
      
      // Get leads/clients that match the date criteria
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      // This is a simplified version - would need more complex querying
      // For now, we'll rely on manual triggers or scheduled jobs
      console.log(`Date-based workflow ${workflow.workflowName} needs scheduled execution`);
    }

    return executed;
  }
}

module.exports = new WorkflowExecutor();

