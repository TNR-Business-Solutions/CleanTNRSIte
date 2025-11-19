# Automation/Workflows Feature Module

## Purpose
Business automation workflow system for creating automated processes and triggers.

## Files
- `index.html` - Automation main page
- `styles.css` - Automation-specific styles
- `automation.js` - Automation JavaScript functions

## Dependencies
- `admin/shared/header.html` - Admin header navigation
- `admin/shared/styles.css` - Shared admin styles
- `admin/shared/utils.js` - Common utilities

## Features

### Workflow Management
- Create new workflows
- Edit existing workflows
- Delete workflows
- Activate/deactivate workflows
- View workflow status and history

### Trigger Types
- **New Lead Created** - Trigger when a new lead is added
- **Lead Status Changed** - Trigger when lead status changes
- **Client Status Changed** - Trigger when client status changes
- **Date-Based Trigger** - Trigger after a certain time period

### Action Types
- **Send Email** - Send automated email with personalization
- **Update Status** - Automatically update lead/client status
- **Add Note** - Add notes to lead/client records
- **Assign Tag/Category** - Add tags to leads/clients

## API Endpoints Used
- `GET /api/workflows` - Get all workflows
- `POST /api/workflows` - Create workflow
- `PUT /api/workflows` - Update workflow
- `DELETE /api/workflows?workflowId=:id` - Delete workflow

## Usage
Navigate to `/admin/automation/` to access the automation feature.

## Testing
1. Open `/admin/automation/index.html` in browser
2. Click "+ Create Workflow"
3. Enter workflow name
4. Select trigger type
5. Configure trigger fields (if needed)
6. Add actions
7. Save workflow
8. Test workflow activation/deactivation

