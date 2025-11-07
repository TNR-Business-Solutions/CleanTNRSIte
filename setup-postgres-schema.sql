-- TNR Business Solutions - Postgres Database Schema
-- Run this in the Neon SQL Editor to create all required tables

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  website TEXT,
  industry TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  services TEXT,
  status TEXT DEFAULT 'Active',
  joinDate TEXT,
  lastContact TEXT,
  notes TEXT,
  source TEXT,
  businessType TEXT,
  businessName TEXT,
  businessAddress TEXT,
  interest TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  website TEXT,
  industry TEXT,
  services TEXT,
  budget TEXT,
  timeline TEXT,
  message TEXT,
  additionalInfo TEXT,
  contactMethod TEXT,
  source TEXT DEFAULT 'Website Form',
  status TEXT DEFAULT 'New',
  date TEXT,
  submissionDate TEXT,
  submissionDateTime TEXT,
  originalSubmissionId TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zipCode TEXT,
  notes TEXT,
  businessType TEXT,
  businessName TEXT,
  businessAddress TEXT,
  interest TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  orderNumber TEXT UNIQUE NOT NULL,
  clientName TEXT NOT NULL,
  clientId TEXT,
  customerInfo TEXT,
  items TEXT,
  amount REAL,
  status TEXT DEFAULT 'Pending',
  orderDate TEXT,
  description TEXT,
  projectTimeline TEXT,
  specialRequests TEXT,
  invoiceNumber TEXT,
  paymentMethod TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Form submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  industry TEXT,
  website TEXT,
  message TEXT,
  source TEXT DEFAULT 'Website Form',
  status TEXT DEFAULT 'New',
  convertedToLead INTEGER DEFAULT 0,
  submissionDate TEXT,
  additionalData TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social media posts table
CREATE TABLE IF NOT EXISTS social_media_posts (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  scheduledDate TEXT,
  publishedDate TEXT,
  status TEXT DEFAULT 'draft',
  clientName TEXT,
  contentType TEXT,
  hashtags TEXT,
  imageUrl TEXT,
  metadata TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Automation workflows table
CREATE TABLE IF NOT EXISTS automation_workflows (
  id TEXT PRIMARY KEY,
  workflowName TEXT NOT NULL,
  workflowType TEXT NOT NULL,
  trigger TEXT,
  actions TEXT,
  isActive INTEGER DEFAULT 1,
  lastRun TEXT,
  nextRun TEXT,
  metadata TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id TEXT PRIMARY KEY,
  eventType TEXT NOT NULL,
  eventData TEXT,
  userId TEXT,
  sessionId TEXT,
  timestamp TEXT,
  metadata TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity timeline table
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  activityType TEXT NOT NULL,
  title TEXT,
  description TEXT,
  userId TEXT,
  metadata TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY,
  templateName TEXT NOT NULL,
  subject TEXT NOT NULL,
  htmlContent TEXT NOT NULL,
  textContent TEXT,
  variables TEXT,
  category TEXT,
  isDefault INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social media tokens table
CREATE TABLE IF NOT EXISTS social_media_tokens (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  page_id TEXT,
  access_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TEXT,
  refresh_token TEXT,
  user_id TEXT,
  page_name TEXT,
  instagram_account_id TEXT,
  instagram_username TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_orders_clientId ON orders(clientId);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_activities_entityId ON activities(entityId);
CREATE INDEX IF NOT EXISTS idx_activities_entityType ON activities(entityType);

