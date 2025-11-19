# CRM Feature Module

## Purpose
Complete Client Relationship Management system for managing clients, leads, and orders.

## Files
- `index.html` - CRM main page
- `styles.css` - CRM-specific styles
- `crm.js` - CRM JavaScript functions

## Dependencies
- `admin/shared/header.html` - Admin header navigation
- `admin/shared/styles.css` - Shared admin styles
- `admin/shared/utils.js` - Common utilities (formatDate, closeModal, etc.)
- `crm-data.js` - CRM data management class
- `admin-api-client.js` - API client utilities

## Features

### Clients
- View all clients with filtering (status, businessType, source, search)
- Sort by name, status, createdAt
- Add new clients manually
- Edit existing clients
- Delete clients
- Live contact links (tel: and mailto:)

### Leads
- View all leads with filtering (status, businessType, source, interest, search)
- Sort by name, status, createdAt
- Convert leads to clients
- Delete leads
- CSV import functionality
- Live contact links

### Orders
- View all orders
- Add new orders (existing or new clients)
- Edit orders
- Delete orders
- Update order status

## API Endpoints Used
- `GET /api/crm/clients` - List clients
- `POST /api/crm/clients` - Create client
- `PUT /api/crm/clients?clientId=:id` - Update client
- `DELETE /api/crm/clients?clientId=:id` - Delete client
- `GET /api/crm/leads` - List leads
- `POST /api/crm/leads/convert?leadId=:id` - Convert lead to client
- `DELETE /api/crm/leads?leadId=:id` - Delete lead
- `POST /api/crm/import-leads` - Import leads from CSV
- `GET /api/crm/orders` - List orders
- `POST /api/crm/orders` - Create order
- `PUT /api/crm/orders?orderId=:id` - Update order
- `DELETE /api/crm/orders?orderId=:id` - Delete order

## Usage
Navigate to `/admin/crm/` to access the CRM feature.

## Testing
1. Open `/admin/crm/index.html` in browser
2. Verify clients load correctly
3. Test adding a new client
4. Test editing a client
5. Test deleting a client
6. Test leads functionality
7. Test orders functionality
8. Test CSV import

